import { createCryptoClient } from '../crypto';

describe('CryptoClient', () => {
  test('encrypt/decrypt', () => {
    const client = createCryptoClient();

    const input = 'secret value';
    const output = client.encrypt(input);
    const result = client.decrypt(output);

    expect(input).not.toBe(output);
    expect(result).toBe(input);
  });
});
