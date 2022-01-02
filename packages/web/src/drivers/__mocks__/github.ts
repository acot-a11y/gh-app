import { vi } from 'vitest';
import type { MockFactory } from '../../__mocks__/types';
import type { GhClient } from '../github';

export const createGhClientMock: MockFactory<GhClient> = (mocks = {}) => ({
  authorize: vi.fn(),
  getAuthenticatedUser: vi.fn(),
  getInstallationList: vi.fn(),
  getRepositoryListByInstallationId: vi.fn(),
  ...mocks,
});
