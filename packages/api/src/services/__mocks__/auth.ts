import type { MockFactory } from '../../__mocks__/types';
import type { AuthService } from '../auth';

export const createAuthServiceMock: MockFactory<AuthService> = (
  mocks = {},
) => ({
  loginAsUser: jest.fn(),
  loginAsApp: jest.fn(),
  ...mocks,
});
