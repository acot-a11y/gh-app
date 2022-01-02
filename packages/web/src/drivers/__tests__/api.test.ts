import nock from 'nock';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { API_URL } from '../../constants';
import type { ApiClient } from '../api';
import { createApiClient } from '../api';

describe('ApiClient', () => {
  let scope: nock.Scope;
  let client: ApiClient;

  beforeEach(() => {
    if (!nock.isActive()) {
      nock.activate();
    }

    scope = nock(API_URL);

    client = createApiClient();
  });

  afterEach(() => {
    nock.restore();
    nock.cleanAll();
  });

  test('login', async () => {
    scope
      .post('/auth', {
        code: 'code',
      })
      .reply(200, { ok: true });

    const res = await client.login({
      code: 'code',
    });

    expect(res).toEqual({ ok: true });
  });

  test('generateAppToken', async () => {
    scope
      .post('/app/token', {
        installation_id: 12345,
        owner: 'owner',
        repo: 'repo',
      })
      .matchHeader('Authorization', 'github token')
      .reply(200, { ok: true });

    const res = await client.generateAppToken({
      installation_id: 12345,
      owner: 'owner',
      repo: 'repo',
      token: 'token',
    });

    expect(res).toEqual({ ok: true });
  });
});
