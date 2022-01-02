export type MockFactory<T extends Record<string, any>> = (mocks?: {
  [P in keyof T]?: jest.Mock;
}) => T;
