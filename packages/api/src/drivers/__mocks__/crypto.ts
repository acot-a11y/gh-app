import type { MockFactory } from '../../__mocks__/types';
import type { CryptoClient } from '../crypto';

export const createCryptoClientMock: MockFactory<CryptoClient> = (
  mocks = {},
) => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  ...mocks,
});
