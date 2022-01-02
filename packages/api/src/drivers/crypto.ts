import crypto from 'crypto';
import { APP_TOKEN_KEY } from '../constants';

export type CryptoClient = {
  encrypt: (input: string) => string;
  decrypt: (input: string) => string;
};

export const createCryptoClient = (): CryptoClient => {
  const bufkey = Buffer.from(APP_TOKEN_KEY, 'hex');

  return {
    encrypt: (input) => {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', bufkey, iv);

      return Buffer.concat([
        iv,
        cipher.update(input, 'utf8'),
        cipher.final(),
        cipher.getAuthTag(),
      ]).toString('base64');
    },

    decrypt: (input) => {
      const buf = Buffer.from(input, 'base64');
      const iv = buf.slice(0, 12);
      const tag = buf.slice(buf.length - 16);
      const enc = buf.slice(12, buf.length - 16);

      const decipher = crypto.createDecipheriv('aes-256-gcm', bufkey, iv);
      decipher.setAuthTag(tag);

      return Buffer.concat([decipher.update(enc), decipher.final()]).toString(
        'utf8',
      );
    },
  };
};
