import type { Summary } from '@acot/types';
import * as schema from './pr.json';

export type PrCommentMeta = {
  core: {
    version: string;
  };
  runner: {
    name: string;
    version: string;
  };
  commit: string;
  origin: string;
};

// POST /pr/comment
export type PostPrCommentRequest = {
  number: number;
  meta: PrCommentMeta;
  summary: Summary;
};

export const PostPrCommentRequestSchema = schema.PostPrCommentRequest;

export type PostPrCommentSuccessResponse = {};

export type PostPrCommentFailureResponse = {
  error: string;
};

export type PostPrCommentResponse =
  | PostPrCommentSuccessResponse
  | PostPrCommentFailureResponse;
