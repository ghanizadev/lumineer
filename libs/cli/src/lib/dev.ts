import { Command } from 'commander';
import * as chokidar from 'chokidar';
import * as cp from 'node:child_process';
import * as process from 'node:process';
import { Logger } from '@lumineer/logger';
import * as treeKill from 'tree-kill';

const CMD = 'npx ts-node ./src/main.ts';

const logger = new Logger('Dev', 'bgYellow');
let childProcess: cp.ChildProcessWithoutNullStreams;

function spawnServer() {
  try {
    childProcess = cp.spawn(CMD, {
      cwd: process.cwd(),
      env: { ...process.env, FORCE_COLOR: 1 } as any,
      shell: true,
      stdio: 'inherit',
    });
  } catch {}
}

async function dev(
  value: Record<string, string | number | boolean>,
  options: Command
) {
  logger.info('Starting server');
  const watcher = chokidar.watch(process.cwd(), {
    ignored: ['**/node_modules/**', '**/.lumineer/**/*'],
    ignoreInitial: true,
    ignorePermissionErrors: true,
  });

  watcher.on('change', () => {
    logger.warn('Restarting');
    treeKill(childProcess.pid);
    spawnServer();
  });

  watcher.on('ready', async () => {
    logger.info('Ready');
    spawnServer();
  });
}

process.on('SIGINT', () => {
  logger.warn('Closing the server...');
  treeKill(childProcess.pid);
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.warn('Closing the server...');
  treeKill(childProcess.pid);
  process.exit(0);
});

const command = new Command('dev')
  .description('Start the development server')
  .option('-p, --port', 'Build the development version')
  .option('-H, --host', 'Build the development version')
  .action(dev);

export default command;
