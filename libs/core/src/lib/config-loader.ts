import * as fs from 'node:fs';
import * as process from 'node:process';
import * as path from 'node:path';
import anymatch from 'anymatch';
import { LumineerConfig } from './types';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export class ConfigLoader {
  private readonly configPath: string | undefined;

  constructor() {
    this.configPath = this.getFlag('config');
    if (this.configPath) {
      this.configPath = path.resolve(process.cwd(), this.configPath);
    }
  }

  private getFlag(flag: string) {
    const argv = yargs(hideBin(process.argv)).argv;
    return argv[flag];
  }

  public async loadConfig() {
    let configFile = this.configPath;

    if (!configFile) {
      const files = fs.readdirSync(process.cwd());

      for (const file of files) {
        const filePath = path.resolve(process.cwd(), file);
        const stat = fs.statSync(filePath);

        if (stat.isFile() && anymatch(['lumineer.config.{js,mjs}'], file)) {
          configFile = filePath;
          break;
        }
      }
    }

    if (!configFile) throw new Error('Configuration file not found');

    return this.loadJS(configFile);
  }

  private async loadJS(filePath: string): Promise<LumineerConfig> {
    const config = await import(filePath);

    if (typeof config?.default === 'function') {
      return config.default();
    }

    if (typeof config?.default === 'object') {
      return config.default;
    }

    if (typeof config === 'function') {
      return config();
    }

    return config;
  }
}
