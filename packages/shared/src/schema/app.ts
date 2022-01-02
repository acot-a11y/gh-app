import * as schema from './app.json';

// POST /app/token
export type PostAppTokenRequest = {
  installation_id: number;
  owner: string;
  repo: string;
};

export const PostAppTokenRequestSchema = schema.PostAppTokenRequest;

export type PostAppTokenSuccessResponse = {
  token: string;
};

export type PostAppTokenFailureResponse = {
  error: string;
};

export type PostAppTokenResponse =
  | PostAppTokenSuccessResponse
  | PostAppTokenFailureResponse;
