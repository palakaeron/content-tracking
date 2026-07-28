import { app } from './app.js';import { env } from './config/env.js';import { prisma } from './config/prisma.js';

async function bootstrap() {
  try {
    await prisma.$connect();
    process.stdout.write('Database connection established\n');
    app.listen(env.PORT, () => {
      process.stdout.write(`API listening on ${env.PORT}\n`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Failed to start API: ${message}\n`);
    process.exit(1);
  }
}

bootstrap();

