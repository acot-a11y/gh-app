import type { Headers } from 'got';
import got from 'got';

export type GhUser = {
  id: number;
  login: string;
  type: string;
  avatar_url: string;
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

export type GhIssueComment = {
  id: number;
  body: string;
  user: GhUser;
  created_at: string;
  updated_at: string;
};

// POST github.com/login/oauth/access_token
export type GhExchangeCodeForTokenRequest = {
  client_id: string;
  client_secret: string;
  code: string;
  redirect_uri?: string;
};

export type GhExchangeCodeForTokenSuccessResponse = {
  access_token: string;
  expires_in: number;
};

export type GhExchangeCodeForTokenFailureResponse = {
  error: string;
  error_description: string;
  error_uri: string;
};

export type GhExchangeCodeForTokenResponse =
  | GhExchangeCodeForTokenSuccessResponse
  | GhExchangeCodeForTokenFailureResponse;

// POST /app/installations/{installation_id}/access_tokens
export type GhCreateInstallationAccessTokenRequest = {
  token: string;
  installation_id: number;
};

export type GhCreateInstallationAccessTokenResponse = {
  token: string;
  expires_at: string;
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

// GET /user
export type GhGetAuthenticatedUserRequest = {
  token: string;
};

export type GhGetAuthenticatedUserResponse = GhUser;

// GET /repos/{owner}/{repo}/issues/{issue_number}/comments
export type GhGetIssueCommentListRequest = {
  token: string;
  owner: string;
  repo: string;
  issue_number: number;
  per_page?: number;
  page?: number;
};

export type GhGetIssueCommentListResponse = GhIssueComment[];

// POST /repos/{owner}/{repo}/issues/{issue_number}/comments
export type GhCreateIssueCommentRequest = {
  token: string;
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
};

export type GhCreateIssueCommentResponse = GhIssueComment;

// PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}
export type GhUpdateIssueCommentRequest = {
  token: string;
  owner: string;
  repo: string;
  comment_id: number;
  body: string;
};

export type GhUpdateIssueCommentResponse = GhIssueComment;

// API Client
export type GhClient = {
  exchangeCodeForToken: (
    request: GhExchangeCodeForTokenRequest,
  ) => Promise<GhExchangeCodeForTokenResponse>;
  createInstallationAccessToken: (
    request: GhCreateInstallationAccessTokenRequest,
  ) => Promise<GhCreateInstallationAccessTokenResponse>;
  getRepositoryListByInstallationId: (
    request: GhGetRepositoryListByInstallationIdRequest,
  ) => Promise<GhGetRepositoryListByInstallationIdResponse>;
  getAuthenticatedUser: (
    request: GhGetAuthenticatedUserRequest,
  ) => Promise<GhGetAuthenticatedUserResponse>;
  getIssueCommentList: (
    request: GhGetIssueCommentListRequest,
  ) => Promise<GhGetIssueCommentListResponse>;
  createIssueComment: (
    request: GhCreateIssueCommentRequest,
  ) => Promise<GhCreateIssueCommentResponse>;
  updateIssueComment: (
    request: GhUpdateIssueCommentRequest,
  ) => Promise<GhUpdateIssueCommentResponse>;
};

export const createGhClient = (): GhClient => {
  const headers: Headers = {
    Accept: 'application/vnd.github.v3+json',
  };

  const auth = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  const client = got.extend({
    prefixUrl: 'https://api.github.com/',
    headers,
  });

  return {
    exchangeCodeForToken: (request) =>
      client
        .post('login/oauth/access_token', {
          prefixUrl: 'https://github.com/',
          json: request,
        })
        .json<GhExchangeCodeForTokenResponse>(),

    createInstallationAccessToken: ({ token, installation_id }) =>
      client
        .post(`app/installations/${installation_id}/access_tokens`, {
          headers: auth(token),
        })
        .json<GhCreateInstallationAccessTokenResponse>(),

    getRepositoryListByInstallationId: ({ token, installation_id, ...rest }) =>
      client
        .get(`user/installations/${installation_id}/repositories`, {
          headers: auth(token),
          searchParams: {
            ...rest,
          },
        })
        .json<GhGetRepositoryListByInstallationIdResponse>(),

    getAuthenticatedUser: ({ token }) =>
      client
        .get('user', {
          headers: auth(token),
        })
        .json<GhGetAuthenticatedUserResponse>(),

    getIssueCommentList: ({ token, owner, repo, issue_number, ...rest }) =>
      client
        .get(`repos/${owner}/${repo}/issues/${issue_number}/comments`, {
          headers: auth(token),
          searchParams: {
            ...rest,
          },
        })
        .json<GhGetIssueCommentListResponse>(),

    createIssueComment: ({ token, owner, repo, issue_number, ...rest }) =>
      client
        .post(`repos/${owner}/${repo}/issues/${issue_number}/comments`, {
          headers: auth(token),
          json: rest,
        })
        .json<GhCreateIssueCommentResponse>(),

    updateIssueComment: ({ token, owner, repo, comment_id, ...rest }) =>
      client
        .post(`repos/${owner}/${repo}/issues/comments/${comment_id}`, {
          headers: auth(token),
          json: rest,
        })
        .json<GhUpdateIssueCommentResponse>(),
  };
};
