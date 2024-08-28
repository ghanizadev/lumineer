import { Command } from 'commander';
import { Logger } from '@lumineer/logger';
import * as cp from 'node:child_process';
import * as process from 'node:process';

const DIR = process.cwd();
const CMD = 'npx tsc --project tsconfig.json';

const logger = new Logger('Build', 'bgYellow');
let childProcess: cp.ChildProcessWithoutNullStreams;

function compile() {
  childProcess = cp.spawn(CMD, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
    cwd: DIR,
  });
  let start: number;

  childProcess.on('spawn', () => {
    start = performance.now();
    logger.info('Building application');
  });

  childProcess.on('exit', () => {
    const end = performance.now();
    logger.info(`Build completed! - ${(end - start).toFixed(2)} ms`);
  });
}

async function build(
  value: Record<string, string | boolean | number>,
  options: Command
) {
  compile();
}

const command = new Command('build')
  .description('Build the Lumineer application')
  .option('-D, --dev', 'Build the development version')
  .action(build);

export default command;
