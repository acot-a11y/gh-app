import type { JestMockCompatFn } from 'vitest';

export type MockFactory<T extends Record<string, any>> = (mocks?: {
  [P in keyof T]?: JestMockCompatFn;
}) => T;
