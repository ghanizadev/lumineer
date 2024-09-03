import 'reflect-metadata';
import 'jest-extended';
import yargs from 'yargs';
import * as path from 'node:path';

import { ConfigLoader } from '../src/lib/config-loader';

const cwdMock = jest.fn().mockReturnValue(path.resolve(__dirname, '..'));

jest.mock('yargs');
jest.mock('../src/lib/constants/server.constants', () => ({
  get CWD() {
    return cwdMock();
  },
}));

describe('Load Config', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should load .js files', async () => {
    (yargs as any).mockReturnValue({
      argv: {
        config: './fixtures/lumineer.config.js',
      },
    });

    const loader = new ConfigLoader();
    const value = await loader.loadConfig();

    expect(value.configFolder).toEqual('./.mytestfolder');
    expect(value.packageName).toEqual('com.package.my');
  });

  it('should load .js files from CWD', async () => {
    cwdMock.mockReturnValue(path.resolve(__dirname, '..', 'fixtures'));
    (yargs as any).mockImplementation(() => ({
      argv: {},
    }));

    const loader = new ConfigLoader();
    const value = await loader.loadConfig();

    expect(value.configFolder).toEqual('./.mytestfolder');
    expect(value.packageName).toEqual('com.package.my');
  });
});
