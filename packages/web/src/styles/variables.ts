export const Space = 8;

type Enum<T extends Record<keyof any, any>> = T[keyof T];

export type BreakPoint = Enum<typeof BreakPoint>;
export const BreakPoint = {
  SMALL: 640,
  MEDIUM: 768,
  LARGE: 1024,
  X_LARGE: 1280,
} as const;
