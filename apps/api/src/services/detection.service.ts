import crypto from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { audit } from './audit.service.js';

export interface DetectionMatch {
  sourceUrl: string;
  confidence: number;
  matchType: string;
  domain: string;
}

export interface DetectionProvider {
  scan(content: { id: string; title: string; type: string }): Promise<DetectionMatch[]>;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

/** Simulated platform sources for realism */
const PLATFORMS = [
  'instagram.com',
  'pinterest.com',
  'twitter.com',
  'reddit.com',
  'tumblr.com',
  'flickr.com',
  'unsplash.com',
  'shutterstock.com',
  'pexels.com',
  'deviantart.com',
];

function formatMatch(
  content: { id: string; title: string; type: string },
  index: number,
  seed: number,
): DetectionMatch {
  const slug = content.title.toLowerCase().replace(/\s+/g, '-');
  // Pick a realistic platform from the list
  const platform = PLATFORMS[(seed + index * 3) % PLATFORMS.length];
  const sourceUrl = `https://${platform}/content/${encodeURIComponent(slug)}-${seed.toString(16)}${index}`;

  // Confidence range: 0.72 – 0.99  (spread across the full severity spectrum)
  // Uses a wider spread so LOW/MEDIUM/HIGH/CRITICAL are all reachable
  const raw = ((seed * 7 + index * 31) % 28) / 100; // 0.00 – 0.27
  const confidence = Number((0.72 + raw).toFixed(2));

  const matchType = content.type === 'IMAGE' ? 'Visual similarity'
    : content.type === 'VIDEO' ? 'Video fingerprint'
    : 'Text similarity';

  return { sourceUrl, confidence, matchType, domain: extractDomain(sourceUrl) };
}

/** Deterministic local simulator — always returns at least 1 match per scan */
export class SimulationDetectionProvider implements DetectionProvider {
  async scan(content: { id: string; title: string; type: string }): Promise<DetectionMatch[]> {
    const seed = parseInt(
      crypto.createHash('sha256').update(content.id).digest('hex').slice(0, 4),
      16,
    );
    // Always produce 1–3 matches so every scan yields detections and alerts
    const count = 1 + (seed % 3); // 1, 2, or 3
    return Array.from({ length: count }, (_, index) => formatMatch(content, index, seed));
  }
}

let activeProvider: DetectionProvider = new SimulationDetectionProvider();

export function setDetectionProvider(provider: DetectionProvider): void {
  activeProvider = provider;
}

function severityFor(confidence: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (confidence >= 0.95) return 'CRITICAL';
  if (confidence >= 0.88) return 'HIGH';
  if (confidence >= 0.80) return 'MEDIUM';
  return 'LOW';
}

export async function scanContent(ownerId: string, id: string): Promise<number> {
  const content = await prisma.content.findFirst({
    where: { id, ownerId, NOT: { status: 'DELETED' } },
  });
  if (!content) return 0;

  await prisma.content.update({ where: { id }, data: { status: 'SCANNING' } });

  const matches = await activeProvider.scan(content);
  let created = 0;

  for (const match of matches) {
    const report = await prisma.report.create({
      data: {
        contentId: id,
        sourceUrl: match.sourceUrl,
        confidence: match.confidence,
        matchType: match.matchType,
      },
    });
    created += 1;

    // Create an alert for EVERY match — severity reflects how dangerous it is
    const severity = severityFor(match.confidence);
    await prisma.alert.create({
      data: { ownerId, reportId: report.id, severity },
    });

    await audit(ownerId, 'DETECTION_MATCH', undefined, {
      contentId: id,
      reportId: report.id,
      domain: match.domain,
      confidence: match.confidence,
      sourceUrl: match.sourceUrl,
    });
  }

  await prisma.content.update({ where: { id }, data: { status: 'AVAILABLE' } });
  await audit(ownerId, 'CONTENT_SCANNED', undefined, {
    contentId: id,
    matchesFound: created,
  });

  return created;
}
