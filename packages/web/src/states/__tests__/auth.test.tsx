import { act } from '@testing-library/react-hooks';
import { createMemoryHistory, ReactLocation, Router } from 'react-location';
import { describe, test, expect, afterEach, vi } from 'vitest';
import { createApiClientMock } from '../../drivers/__mocks__/api';
import { createGhClientMock } from '../../drivers/__mocks__/github';
import { renderRecoilHook } from '../../__tests__/hooks';
import { useAuth, useAuthCallback, useInitializeAuth } from '../auth';
import { apiClientState, ghClientState } from '../driver';

const MemoryRouter: React.FC = ({ children }) => {
  return (
    <Router
      location={new ReactLocation({ history: createMemoryHistory() })}
      routes={[]}
    >
      {children}
    </Router>
  );
};

describe('states/auth', () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe('useInitializeAuth', () => {
    test('without token', async () => {
      const { result, waitForNextUpdate } = renderRecoilHook(
        () => useInitializeAuth(),
        {
          states: [[ghClientState, createGhClientMock()]],
        },
      );

      await waitForNextUpdate();

      expect(result.current).toEqual({
        loggedIn: false,
      });
    });

    test('with token', async () => {
      localStorage.setItem('token', 'token');

      const { result, waitForNextUpdate } = renderRecoilHook(
        () => useInitializeAuth(),
        {
          states: [
            [
              ghClientState,
              createGhClientMock({
                getAuthenticatedUser: vi.fn().mockResolvedValueOnce({
                  id: 'id',
                  login: 'login',
                  avatar_url: 'avatar_url',
                }),
              }),
            ],
          ],
        },
      );

      await waitForNextUpdate();

      expect(result.current).toEqual({
        loggedIn: true,
      });
    });
  });

  describe('useAuth', () => {
    test('without token', async () => {
      const { result, waitForNextUpdate } = renderRecoilHook(() => useAuth(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
        states: [[ghClientState, createGhClientMock()]],
      });

      await waitForNextUpdate();

      expect(result.current.user).toBeNull();
    });

    test('with token', async () => {
      localStorage.setItem('token', 'token');

      const { result, waitForNextUpdate } = renderRecoilHook(() => useAuth(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
        states: [
          [
            ghClientState,
            createGhClientMock({
              getAuthenticatedUser: vi.fn().mockResolvedValueOnce({
                id: 'id',
                login: 'login',
                avatar_url: 'avatar_url',
              }),
            }),
          ],
        ],
      });

      await waitForNextUpdate();

      expect(result.current.user).toEqual({
        id: 'id',
        login: 'login',
        avatar: 'avatar_url',
      });
    });

    test('login', async () => {
      const github = createGhClientMock();

      const { result, waitForNextUpdate } = renderRecoilHook(() => useAuth(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
        states: [[ghClientState, github]],
      });

      await waitForNextUpdate();

      result.current.login();
      expect(github.authorize).toBeCalled();
    });

    // FIXME ...
    test.skip('logout', async () => {
      const history = createMemoryHistory();
      const location = new ReactLocation({ history });
      const github = createGhClientMock();

      const { result, waitForNextUpdate } = renderRecoilHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <Router location={location} routes={[]}>
            {children}
          </Router>
        ),
        states: [[ghClientState, github]],
      });

      await waitForNextUpdate();

      act(() => {
        result.current.logout();
      });

      expect(history.location.pathname).toBe('/login');
    });
  });

  describe('useAuthCallback', () => {
    // FIXME ...
    test.skip('valid code', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/auth/callback?code=aaa'],
      });

      const location = new ReactLocation({ history });

      const api = createApiClientMock({
        login: vi.fn().mockResolvedValueOnce({
          token: 'token',
        }),
      });

      const { result, waitForNextUpdate } = renderRecoilHook(
        () => useAuthCallback(),
        {
          wrapper: ({ children }) => (
            <Router location={location} routes={[]}>
              {children}
            </Router>
          ),
          states: [[apiClientState, api]],
        },
      );

      await waitForNextUpdate();

      expect(result.current).toBeUndefined();

      expect(api.login).toBeCalledWith({
        code: 'aaa',
      });

      expect(history.location.pathname).toBe('/');
    });

    // FIXME ...
    test.skip('invalid code', async () => {
      const history = createMemoryHistory({
        initialEntries: ['/auth/callback'],
      });

      const location = new ReactLocation({ history });

      const api = createApiClientMock();

      const { result, waitForNextUpdate } = renderRecoilHook(
        () => useAuthCallback(),
        {
          wrapper: ({ children }) => (
            <Router location={location} routes={[]}>
              {children}
            </Router>
          ),
          states: [[apiClientState, api]],
        },
      );

      await act(() => waitForNextUpdate());

      expect(result.error?.message).toBe('invalid code');
      expect(api.login).not.toBeCalled();
      expect(history.location.pathname).toBe('/auth/callback');
    });
  });
});
