import type { Logger } from '../logging';
import type { MockFactory } from './types';

export const createLoggerMock: MockFactory<Logger> = (mocks = {}) => ({
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  ...mocks,
});
