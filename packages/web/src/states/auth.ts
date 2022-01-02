import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  atom,
  selector,
  selectorFamily,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { apiClientState, ghClientState, useGhClient } from './driver';

const TOKEN_KEY = 'token';

export type User = {
  id: number;
  login: string;
  avatar: string;
};

export const tokenState = atom<string | null>({
  key: 'auth/token',
  default: null,
  effects_UNSTABLE: [
    ({ setSelf, onSet, trigger }) => {
      if (trigger === 'get') {
        const saved = localStorage.getItem(TOKEN_KEY);
        if (saved != null) {
          setSelf(saved);
        }
      }

      onSet((newValue) => {
        if (newValue == null) {
          localStorage.removeItem(TOKEN_KEY);
        } else {
          localStorage.setItem(TOKEN_KEY, newValue);
        }
      });
    },
  ],
});

const userState = atom<User | null>({
  key: 'auth/user',
  default: selector({
    key: 'auth/user/query',
    get: async ({ get }) => {
      const github = get(ghClientState);
      const token = get(tokenState);
      if (token == null) {
        return null;
      }

      try {
        const data = await github.getAuthenticatedUser({ token });

        return {
          id: data.id,
          login: data.login,
          avatar: data.avatar_url,
        };
      } catch (e) {
        return null;
      }
    },
  }),
});

export const useInitializeAuth = () => {
  const user = useRecoilValue(userState);
  const [token, setToken] = useRecoilState(tokenState);

  useEffect(() => {
    if (user == null && token != null) {
      setToken(null);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    loggedIn: token != null,
  };
};

export const useAuth = () => {
  const navigate = useNavigate();
  const github = useGhClient();
  const user = useRecoilValue(userState);
  const setToken = useSetRecoilState(tokenState);

  const login = useCallback(() => {
    github.authorize();
  }, [github]);

  const logout = useCallback(() => {
    setToken(null);
    navigate('/login', { replace: true });
  }, [navigate, setToken]);

  return {
    user,
    login,
    logout,
  };
};

const authCallbackQuery = selectorFamily<string, string | null>({
  key: 'auth/callback/query',
  get:
    (code) =>
    async ({ get }) => {
      if (code == null) {
        throw new Error('invalid code');
      }

      const api = get(apiClientState);
      const { token } = await api.login({ code });

      return token;
    },
});

export const useAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(location.search);
  const setToken = useSetRecoilState(tokenState);
  const token = useRecoilValue(authCallbackQuery(qs.get('code')));

  useEffect(() => {
    setToken(token);
    navigate('/', { replace: true });
  }, [token, setToken, navigate]);
};
