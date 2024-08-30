import 'reflect-metadata';
import 'jest-extended';
import { ConfigLoader } from '../src/lib/config-loader';

describe('Load Config', () => {
  it('should load .ts files', async () => {
    const loader = new ConfigLoader();
    const value = await loader.loadConfig();

    console.log({ value });

    expect(value.configFolder).toEqual('./.mytestfolder');
    expect(value.packageName).toEqual('com.package.my');
  });
});
