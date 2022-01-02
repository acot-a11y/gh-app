import type {
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteOptions,
} from 'fastify';
import type { RouteGenericInterface } from 'fastify/types/route';

export type Route<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
> = RouteOptions<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  RouteGeneric
>;
