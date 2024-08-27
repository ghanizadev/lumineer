import { Command } from 'commander';
import * as chokidar from 'chokidar';
import * as cp from 'node:child_process';
import * as process from 'node:process';
import { Logger } from '@cymbaline/logger';

const CMD = 'npx ts-node ./src/main.ts';

const logger = new Logger('Dev', 'bgYellow');
let childProcess: cp.ChildProcessWithoutNullStreams;

function spawnServer() {
  if (childProcess) {
    process.kill(-childProcess.pid, 'SIGINT');
  }

  childProcess = cp.spawn(CMD, {
    cwd: process.cwd(),
    env: { ...process.env, FORCE_COLOR: 1 } as any,
    shell: true,
    detached: true,
    stdio: 'inherit',
  });
}

async function dev(
  value: Record<string, string | number | boolean>,
  options: Command
) {
  logger.info('Starting server');
  const watcher = chokidar.watch(process.cwd(), {
    ignored: ['**/node_modules/**', '**/.cymbaline/**/*'],
    ignoreInitial: true,
    ignorePermissionErrors: true,
  });

  watcher.on('change', () => {
    logger.info('Restarting');
    spawnServer();
  });

  watcher.on('ready', async () => {
    spawnServer();
    logger.info('Ready');
  });
}

process.on('SIGINT', () => {
  process.kill(-childProcess.pid, 'SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.kill(-childProcess.pid, 'SIGINT');
  process.exit(0);
});

const command = new Command('dev')
  .description('Start the development server')
  .option('-p, --port', 'Build the development version')
  .option('-H, --host', 'Build the development version')
  .action(dev);

export default command;
