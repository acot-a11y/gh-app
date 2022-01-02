import type { MockFactory } from '../../__mocks__/types';
import type { AppService } from '../app';

export const createAppServiceMock: MockFactory<AppService> = (mocks = {}) => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  revokeToken: jest.fn(),
  ...mocks,
});
