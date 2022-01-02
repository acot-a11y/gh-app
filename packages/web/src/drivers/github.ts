import ky from 'ky';
import type { KyHeadersInit } from 'ky/distribution/types/options';
import { GH_APP_CLIENT_ID, GH_APP_REDIRECT_URI } from '../constants';

export type GhUser = {
  id: number;
  login: string;
  avatar_url: string;
};

export type GhInstallation = {
  id: number;
  account: GhUser;
};

export type GhRepository = {
  id: number;
  name: string;
  full_name: string;
  owner: GhUser;
  description: string;
  private: boolean;
  html_url: string;
};

// GET /user
export type GhGetAuthenticatedUserRequest = {
  token: string;
};

export type GhGetAuthenticatedUserResponse = GhUser;

// GET /user/installations
export type GhGetInstallationListRequest = {
  token: string;
  per_page?: number;
  page?: number;
};

export type GhGetInstallationListResponse = {
  total_count: number;
  installations: GhInstallation[];
};

// GET /user/installations/{installation_id}/repositories
export type GhGetRepositoryListByInstallationIdRequest = {
  token: string;
  installation_id: number;
  per_page?: number;
  page?: number;
};

export type GhGetRepositoryListByInstallationIdResponse = {
  total_count: number;
  repositories: GhRepository[];
};

export type GhClient = {
  authorize: () => void;
  getAuthenticatedUser: (
    request: GhGetAuthenticatedUserRequest,
  ) => Promise<GhGetAuthenticatedUserResponse>;
  getInstallationList: (
    request: GhGetInstallationListRequest,
  ) => Promise<GhGetInstallationListResponse>;
  getRepositoryListByInstallationId: (
    request: GhGetRepositoryListByInstallationIdRequest,
  ) => Promise<GhGetRepositoryListByInstallationIdResponse>;
};

export const createGhClient = (): GhClient => {
  const headers: KyHeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  const auth = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  const client = ky.extend({
    prefixUrl: 'https://api.github.com/',
    headers,
  });

  return {
    authorize: () => {
      window.location.replace(
        `https://github.com/login/oauth/authorize?client_id=${GH_APP_CLIENT_ID}&redirect_uri=${GH_APP_REDIRECT_URI}`,
      );
    },

    getAuthenticatedUser: ({ token }) =>
      client
        .get('user', {
          headers: auth(token),
        })
        .json(),

    getInstallationList: ({ token, ...rest }) =>
      client
        .get('user/installations', {
          searchParams: {
            ...rest,
          },
          headers: auth(token),
        })
        .json<GhGetInstallationListResponse>(),

    getRepositoryListByInstallationId: ({ token, installation_id, ...rest }) =>
      client
        .get(`user/installations/${installation_id}/repositories`, {
          searchParams: {
            ...rest,
          },
          headers: auth(token),
        })
        .json<GhGetRepositoryListByInstallationIdResponse>(),
  };
};
