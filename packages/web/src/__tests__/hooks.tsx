import type {
  Renderer,
  RenderHookOptions,
  RenderHookResult,
} from '@testing-library/react-hooks';
import { renderHook } from '@testing-library/react-hooks';
import { Fragment } from 'react';
import type { RecoilState } from 'recoil';
import { RecoilRoot } from 'recoil';

export const renderRecoilHook = <T, R>(
  callback: (props: T) => R,
  {
    states,
    wrapper,
    ...options
  }: RenderHookOptions<T> & {
    states?: [node: RecoilState<any>, value: any][];
  } = {},
): RenderHookResult<T, R, Renderer<T>> =>
  renderHook(callback, {
    ...options,
    wrapper: ({ children, ...rest }) => {
      const Wrapper = (wrapper ?? Fragment) as any;

      return (
        <Wrapper {...rest}>
          <RecoilRoot
            {...rest}
            initializeState={(snapshot) => {
              (states ?? []).forEach(([node, value]) => {
                snapshot.set(node, value);
              });
            }}
          >
            {children}
          </RecoilRoot>
        </Wrapper>
      );
    },
  });
