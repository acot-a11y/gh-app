import type { MockFactory } from '../../__mocks__/types';
import type { GhClient } from '../github';

export const createGhClientMock: MockFactory<GhClient> = (mocks = {}) => ({
  exchangeCodeForToken: jest.fn(),
  createInstallationAccessToken: jest.fn(),
  getRepositoryListByInstallationId: jest.fn(),
  getAuthenticatedUser: jest.fn(),
  getIssueCommentList: jest.fn(),
  createIssueComment: jest.fn(),
  updateIssueComment: jest.fn(),
  ...mocks,
});
