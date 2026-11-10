import 'dotenv/config';
import { runMarketingOutboxBatch, marketingOutboxStatus } from '@/lib/analytics/conversion-worker';
import { prisma } from '@/lib/db/prisma';

const argumentsList = process.argv.slice(2);
function integerOption(name: string, fallback: number, maximum: number) {
  const index = argumentsList.indexOf(name);
  if (index < 0) return fallback;
  const parsed = Number(argumentsList[index + 1]);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) throw new Error(`Invalid ${name}`);
  return parsed;
}
let stopping = false;
process.on('SIGINT', () => { stopping = true; });
process.on('SIGTERM', () => { stopping = true; });

async function main() {
  if (argumentsList.includes('--status')) {
    console.info(JSON.stringify(await marketingOutboxStatus()));
    return;
  }
  const batch = integerOption('--batch', 20, 100);
  const cycles = integerOption('--cycles', 1, 1000000);
  const interval = integerOption('--interval', 5000, 60000);
  for (let cycle = 0; cycle < cycles && !stopping; cycle += 1) {
    console.info('[marketing.worker]', JSON.stringify(await runMarketingOutboxBatch(batch)));
    if (cycle + 1 < cycles && !stopping) await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

main().catch(() => {
  console.error('[marketing.worker]', { code: 'WORKER_FAILED' });
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
