import nock from 'nock';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { GhClient } from '../github';
import { createGhClient } from '../github';

/* eslint-disable */

describe('GhClient', () => {
  let scope: nock.Scope;
  let client: GhClient;

  beforeEach(() => {
    if (!nock.isActive()) {
      nock.activate();
    }

    scope = nock('https://api.github.com').matchHeader(
      'Accept',
      'application/vnd.github.v3+json',
    );

    client = createGhClient();
  });

  afterEach(() => {
    nock.restore();
    nock.cleanAll();
  });

  test('authorize', () => {
    const location = window.location;

    // @ts-ignore
    delete window.location;

    // @ts-ignore
    window.location = {
      replace: vi.fn(),
    };

    client.authorize();

    expect(window.location.replace).toBeCalled();

    window.location = location;
  });

  test('getAuthenticatedUser', async () => {
    scope
      .get('/user')
      .matchHeader('Authorization', 'Bearer token')
      .reply(200, { ok: true });

    const res = await client.getAuthenticatedUser({
      token: 'token',
    });

    expect(res).toEqual({ ok: true });
  });

  test('getInstallationList', async () => {
    scope
      .get('/user/installations')
      .query({
        per_page: 100,
        page: 1,
      })
      .matchHeader('Authorization', 'Bearer token')
      .reply(200, { ok: true });

    const res = await client.getInstallationList({
      token: 'token',
      per_page: 100,
      page: 1,
    });

    expect(res).toEqual({ ok: true });
  });

  test('getRepositoryListByInstallationId', async () => {
    scope
      .get('/user/installations/12345/repositories')
      .query({
        per_page: 100,
        page: 1,
      })
      .matchHeader('Authorization', 'Bearer token')
      .reply(200, { ok: true });

    const res = await client.getRepositoryListByInstallationId({
      token: 'token',
      installation_id: 12345,
      per_page: 100,
      page: 1,
    });

    expect(res).toEqual({ ok: true });
  });
});
