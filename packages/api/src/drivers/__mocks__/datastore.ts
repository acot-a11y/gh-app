import type { MockFactory } from '../../__mocks__/types';
import type { DatastoreClient } from '../datastore';

export const createDatastoreClientMock: MockFactory<DatastoreClient> = (
  mocks = {},
) => ({
  get: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  ...mocks,
});
