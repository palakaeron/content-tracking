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

function formatMatch(
  content: { id: string; title: string; type: string },
  index: number,
  seed: number,
): DetectionMatch {
  const slug = content.title.toLowerCase().replace(/\s+/g, '-');
  const sourceUrl = `https://example-source-${index + 1}.test/${encodeURIComponent(slug)}`;
  const confidence = Number((0.62 + (((index * 17 + seed * 9) % 33) / 100)).toFixed(2));
  const matchType = content.type === 'TEXT' ? 'Text similarity' : 'Visual similarity';

  return { sourceUrl, confidence, matchType, domain: extractDomain(sourceUrl) };
}

/** Deterministic local simulator; swap providers without changing callers. */
export class SimulationDetectionProvider implements DetectionProvider {
  async scan(content: { id: string; title: string; type: string }): Promise<DetectionMatch[]> {
    const seed = parseInt(crypto.createHash('sha256').update(content.id).digest('hex').slice(0, 2), 16);
    const count = seed % 3;
    return Array.from({ length: count }, (_, index) => formatMatch(content, index, seed));
  }
}

let activeProvider: DetectionProvider = new SimulationDetectionProvider();

export function setDetectionProvider(provider: DetectionProvider): void {
  activeProvider = provider;
}

function severityFor(confidence: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (confidence >= 0.92) return 'CRITICAL';
  if (confidence >= 0.86) return 'HIGH';
  if (confidence >= 0.8) return 'MEDIUM';
  return 'LOW';
}

export async function scanContent(ownerId: string, id: string): Promise<number> {
  const content = await prisma.content.findFirst({ where: { id, ownerId, NOT: { status: 'DELETED' } } });
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

    const severity = severityFor(match.confidence);
    if (match.confidence >= 0.8) {
      await prisma.alert.create({
        data: { ownerId, reportId: report.id, severity },
      });
    }

    await audit(ownerId, 'DETECTION_MATCH', undefined, {
      contentId: id,
      reportId: report.id,
      domain: match.domain,
      confidence: match.confidence,
      sourceUrl: match.sourceUrl,
    });
  }

  await prisma.content.update({ where: { id }, data: { status: 'AVAILABLE' } });
  await audit(ownerId, 'CONTENT_SCANNED', undefined, { contentId: id, matchesFound: created });

  return created;
}
