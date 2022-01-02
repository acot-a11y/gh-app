import { vi } from 'vitest';
import type { MockFactory } from '../../__mocks__/types';
import type { ApiClient } from '../api';

export const createApiClientMock: MockFactory<ApiClient> = (mocks = {}) => ({
  login: vi.fn(),
  generateAppToken: vi.fn(),
  ...mocks,
});
