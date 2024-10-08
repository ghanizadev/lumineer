#!/usr/bin/env node

import { Command } from 'commander';

import build from './build';
import dev from './dev';
import create from './create';

const program = new Command();

program
  .name('lumineer')
  .description('Utility CLI')
  .version('0.0.1')
  .option(
    '-c, --config',
    'Path to the configuration file',
    'lumineer.config.js'
  );

program.addCommand(build);
program.addCommand(dev);
program.addCommand(create);

program.parse();
