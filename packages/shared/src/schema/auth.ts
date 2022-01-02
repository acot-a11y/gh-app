import * as schema from './auth.json';

// POST /auth
export type PostAuthRequest = {
  code: string;
};

export const PostAuthRequestSchema = schema.PostAuthRequest;

export type PostAuthSuccessResponse = {
  token: string;
  expires_at: number;
};

export type PostAuthFailureResponse = {
  error: string;
  help?: string;
};

export type PostAuthResponse =
  | PostAuthSuccessResponse
  | PostAuthFailureResponse;
