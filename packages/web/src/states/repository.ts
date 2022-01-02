import { useCallback } from 'react';
import {
  atom,
  atomFamily,
  selector,
  selectorFamily,
  useRecoilValue,
  useRecoilValueLoadable,
  useSetRecoilState,
} from 'recoil';
import { tokenState } from './auth';
import { apiClientState, ghClientState } from './driver';

export type InstalledRepository = {
  id: number;
  installationId: number;
  owner: string;
  name: string;
  full: string;
  avatar: string;
  description: string;
  private: boolean;
  url: string;
};

/**
 * List
 */
const listState = atom<InstalledRepository[]>({
  key: 'repository/list',
  default: selector({
    key: 'repository/list.query',
    get: async ({ get }) => {
      const github = get(ghClientState);
      const token = get(tokenState);
      if (token == null) {
        return [];
      }

      // FIXME pagination...

      const { installations } = await github.getInstallationList({
        token,
        per_page: 100,
        page: 1,
      });

      const response = await Promise.all(
        installations.map(async ({ id }) => {
          const res = await github.getRepositoryListByInstallationId({
            token,
            installation_id: id,
            per_page: 100,
            page: 1,
          });

          return {
            ...res,
            installationId: id,
          };
        }),
      );

      return response.reduce<InstalledRepository[]>((acc, cur) => {
        cur.repositories.forEach((repo) => {
          acc.push({
            id: repo.id,
            installationId: cur.installationId,
            owner: repo.owner.login,
            name: repo.name,
            full: repo.full_name,
            avatar: repo.owner.avatar_url,
            description: repo.description,
            private: repo.private,
            url: repo.html_url,
          });
        });
        return acc;
      }, []);
    },
  }),
});

export const useInstalledRepositoryList = () => {
  return useRecoilValue(listState);
};

/**
 * Token
 */
const appTokenRequestIdState = atomFamily<number, number>({
  key: 'repository/tokenRequestId',
  default: 0,
});

const appTokenQuery = selectorFamily<string | null, InstalledRepository>({
  key: 'repository/token/query',
  get:
    (repo) =>
    async ({ get }) => {
      const reqId = get(appTokenRequestIdState(repo.id));
      if (reqId === 0) {
        return null;
      }

      const api = get(apiClientState);
      const token = get(tokenState);
      if (token == null) {
        return null;
      }

      const response = await api.generateAppToken({
        installation_id: repo.installationId,
        owner: repo.owner,
        repo: repo.name,
        token,
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      return response.token;
    },
});

export const useAppToken = (repo: InstalledRepository) => {
  return useRecoilValueLoadable(appTokenQuery(repo));
};

export const useRegenerateAppToken = (repo: InstalledRepository) => {
  const setRequestId = useSetRecoilState(appTokenRequestIdState(repo.id));

  const regenerate = useCallback(() => {
    setRequestId((reqId) => reqId + 1);
  }, [setRequestId]);

  return regenerate;
};
