import 'reflect-metadata';
import 'jest-extended';
import { ConfigLoader } from '../src/lib/config-loader';
import yargs from 'yargs';

jest.mock('yargs');

describe('Load Config', () => {
  beforeAll(() => {
    (yargs as any).mockImplementation(() => ({
      argv: {
        config: './fixtures/lumineer.config.js',
      },
    }));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should load .js files', async () => {
    const loader = new ConfigLoader();
    const value = await loader.loadConfig();

    expect(value.configFolder).toEqual('./.mytestfolder');
    expect(value.packageName).toEqual('com.package.my');
  });
});
