import { serverReflection } from './server-reflection';

describe('serverReflection', () => {
  it('should work', () => {
    expect(serverReflection()).toEqual('server-reflection.md');
  });
});
