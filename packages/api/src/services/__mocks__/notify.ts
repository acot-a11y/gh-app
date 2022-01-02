import type { MockFactory } from '../../__mocks__/types';
import type { NotifyService } from '../notify';

export const createNotifyServiceMock: MockFactory<NotifyService> = (
  mocks = {},
) => ({
  comment: jest.fn(),
  ...mocks,
});
