import nock from 'nock';
import type { GhClient } from '../github';
import { createGhClient } from '../github';

describe('GhClient', () => {
  let client: GhClient;
  let scope: nock.Scope;

  beforeEach(() => {
    client = createGhClient();

    if (!nock.isActive()) {
      nock.activate();
    }

    scope = nock('https://api.github.com').matchHeader(
      'Accept',
      'application/vnd.github.v3+json',
    );
  });

  afterEach(() => {
    nock.restore();
    nock.cleanAll();
  });

  test('exchangeCodeForToken', async () => {
    nock('https://github.com')
      .post('/login/oauth/access_token')
      .reply(200, { ok: true });

    const res = await client.exchangeCodeForToken({
      client_id: 'id',
      client_secret: 'secret',
      code: 'code',
      redirect_uri: '/',
    });

    expect(res).toEqual({ ok: true });
  });

  test('createInstallationAccessToken', async () => {
    scope
      .matchHeader('Authorization', 'Bearer token')
      .post('/app/installations/12345/access_tokens')
      .reply(200, { ok: true });

    const res = await client.createInstallationAccessToken({
      token: 'token',
      installation_id: 12345,
    });

    expect(res).toEqual({ ok: true });
  });

  test('getRepositoryListByInstallationId', async () => {
    scope
      .matchHeader('Authorization', 'Bearer token')
      .get('/user/installations/12345/repositories')
      .query({
        per_page: 50,
        page: 1,
      })
      .reply(200, { ok: true });

    const res = await client.getRepositoryListByInstallationId({
      token: 'token',
      installation_id: 12345,
      per_page: 50,
      page: 1,
    });

    expect(res).toEqual({ ok: true });
  });

  test('getAuthenticatedUser', async () => {
    scope
      .matchHeader('Authorization', 'Bearer token')
      .get('/user')
      .reply(200, { ok: true });

    const res = await client.getAuthenticatedUser({
      token: 'token',
    });

    expect(res).toEqual({ ok: true });
  });

  test('getIssueCommentList', async () => {
    scope
      .matchHeader('Authorization', 'Bearer token')
      .get('/repos/owner/repo/issues/321/comments')
      .query({
        per_page: 100,
        page: 1,
      })
      .reply(200, { ok: true });

    const res = await client.getIssueCommentList({
      token: 'token',
      owner: 'owner',
      repo: 'repo',
      issue_number: 321,
      per_page: 100,
      page: 1,
    });

    expect(res).toEqual({ ok: true });
  });

  test('createIssueComment', async () => {
    scope
      .matchHeader('Authorization', 'Bearer token')
      .post('/repos/owner/repo/issues/321/comments')
      .reply(200, { ok: true });

    const res = await client.createIssueComment({
      token: 'token',
      owner: 'owner',
      repo: 'repo',
      issue_number: 321,
      body: 'body',
    });

    expect(res).toEqual({ ok: true });
  });

  test('updateIssueComment', async () => {
    scope
      .matchHeader('Authorization', 'Bearer token')
      .post('/repos/owner/repo/issues/comments/123')
      .reply(200, { ok: true });

    const res = await client.updateIssueComment({
      token: 'token',
      owner: 'owner',
      repo: 'repo',
      comment_id: 123,
      body: 'body',
    });

    expect(res).toEqual({ ok: true });
  });
});
