import { Command } from 'commander';
import { Logger } from '@lumineer/logger';
import * as cp from 'node:child_process';
import * as process from 'node:process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import anymatch from 'anymatch';

const DIR = process.cwd();
const CMD = 'npx tsc --project tsconfig.json';

const logger = new Logger('Build', 'bgYellow');
let childProcess: cp.ChildProcessWithoutNullStreams;

function getConfigFile(cwd: string) {
  const files = fs.readdirSync(cwd);

  for (const file of files) {
    const filePath = path.resolve(cwd, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && anymatch(['lumineer.config.{js,mjs}'], file)) {
      return filePath;
    }
  }

  throw new Error('Config file was not found');
}

async function generateProtobufs() {
  await new Promise((res) => {
    logger.info('Compiling protobufs...');
    const configFile = getConfigFile(DIR);
    const childProcess = cp.spawn(
      `node dist/index.js --dryRun=1 --generateProtobufDefs=1 --config="${configFile}"`,
      {
        stdio: 'inherit',
        shell: true,
        env: process.env,
        cwd: DIR,
      }
    );

    childProcess.on('close', () => {
      logger.info('Protobuf done.');
      res(null);
    });
  });
}

async function compile() {
  await new Promise((res) => {
    childProcess = cp.spawn(CMD, {
      stdio: 'inherit',
      shell: true,
      env: process.env,
      cwd: DIR,
    });

    childProcess.on('spawn', () => {
      logger.info('Building application');
    });

    childProcess.on('close', () => {
      logger.info(`Build done.`);
      res(null);
    });
  });
}

async function build(
  value: Record<string, string | boolean | number>,
  options: Command
) {
  await compile();
  await generateProtobufs();
}

const command = new Command('build')
  .description('Build the Lumineer application')
  .option('-D, --dev', 'Build the development version')
  .action(build);

export default command;
