export type ServiceOutputShape<T, U> = {
  ok: T;
  data: U;
};

export type ServiceSuccessOutput<T> = ServiceOutputShape<true, T>;
export type ServiceFailureOutput<T> = ServiceOutputShape<false, T>;

export type ServiceOutput<Success, Failure> =
  | ServiceSuccessOutput<Success>
  | ServiceFailureOutput<Failure>;

export const output = <T, U>(ok: T, data: U): ServiceOutputShape<T, U> => ({
  ok,
  data,
});
