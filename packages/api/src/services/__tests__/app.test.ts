import { createCryptoClientMock } from '../../drivers/__mocks__/crypto';
import { createDatastoreClientMock } from '../../drivers/__mocks__/datastore';
import { createGhClientMock } from '../../drivers/__mocks__/github';
import { createDriverRegistryMock } from '../../drivers/__mocks__/registry';
import { createLoggerMock } from '../../__mocks__/logging';
import { createAppService } from '../app';

describe('AppService', () => {
  describe('generateToken', () => {
    const input = {
      ghToken: 'ghtoken',
      installation_id: 12345,
      owner: 'acot-a11y',
      repo: 'acot',
    };

    test('success', async () => {
      const datastore = createDatastoreClientMock();

      const service = createAppService(
        createLoggerMock(),
        createDriverRegistryMock()
          .provideValue(
            'crypto',
            createCryptoClientMock({
              encrypt: jest.fn().mockReturnValue('token'),
            }),
          )
          .provideValue('datastore', datastore)
          .provideValue(
            'github',
            createGhClientMock({
              getRepositoryListByInstallationId: jest
                .fn()
                .mockResolvedValueOnce({
                  repositories: [
                    {
                      name: 'through',
                    },
                    {
                      name: input.repo,
                    },
                  ],
                }),
            }),
          ),
      );

      const output = await service.generateToken(input);

      expect(output).toEqual({
        ok: true,
        data: {
          token: 'token',
        },
      });

      expect(datastore.save).toBeCalledWith(
        ['repositories', `${input.owner},${input.repo}`],
        {
          token: 'token',
        },
      );
    });

    test('failure - invalid ghToken', async () => {
      const logger = createLoggerMock();

      const service = createAppService(
        logger,
        createDriverRegistryMock()
          .provideValue('crypto', createCryptoClientMock())
          .provideValue('datastore', createDatastoreClientMock())
          .provideValue(
            'github',
            createGhClientMock({
              getRepositoryListByInstallationId: jest
                .fn()
                .mockRejectedValue(new Error('test')),
            }),
          ),
      );

      const output = await service.generateToken(input);

      expect(output).toEqual({
        ok: false,
        data: {
          error: 'test',
        },
      });

      expect(logger.error).toBeCalled();
    });

    test('failure - do not have permission', async () => {
      const service = createAppService(
        createLoggerMock(),
        createDriverRegistryMock()
          .provideValue('crypto', createCryptoClientMock())
          .provideValue('datastore', createDatastoreClientMock())
          .provideValue(
            'github',
            createGhClientMock({
              getRepositoryListByInstallationId: jest
                .fn()
                .mockResolvedValueOnce({
                  repositories: [
                    {
                      name: 'notfound',
                    },
                  ],
                }),
            }),
          ),
      );

      const output = await service.generateToken(input);

      expect(output).toEqual({
        ok: false,
        data: {
          error: 'repository does not found',
        },
      });
    });
  });

  describe('verifyToken', () => {
    const input = {
      token: 'token',
    };

    test('success', async () => {
      const data = {
        installation_id: 12345,
        owner: 'acot-a11y',
        repo: 'acot',
      };

      const service = createAppService(
        createLoggerMock(),
        createDriverRegistryMock()
          .provideValue(
            'crypto',
            createCryptoClientMock({
              decrypt: jest.fn().mockReturnValueOnce(JSON.stringify(data)),
            }),
          )
          .provideValue(
            'datastore',
            createDatastoreClientMock({
              get: jest.fn().mockImplementationOnce((v) => {
                if (v[1] === `${data.owner},${data.repo}`) {
                  return {
                    token: input.token,
                  };
                }
                throw new Error('test');
              }),
            }),
          )
          .provideValue('github', createGhClientMock()),
      );

      const output = await service.verifyToken(input);

      expect(output).toEqual({
        ok: true,
        data,
      });
    });

    test.each([
      [
        {
          installation_id: 12345,
        },
        {
          repo: 'only repo',
        },
        {
          owner: 'only owner',
        },
        {
          installation_id: 'string',
          owner: 'foo',
          repo: 'bar',
        },
        {
          installation_id: 12345,
          owner: false,
          repo: true,
        },
      ],
    ])('failure - broken (%p)', async (data) => {
      const service = createAppService(
        createLoggerMock(),
        createDriverRegistryMock()
          .provideValue(
            'crypto',
            createCryptoClientMock({
              decrypt: jest.fn().mockReturnValueOnce(JSON.stringify(data)),
            }),
          )
          .provideValue('datastore', createDatastoreClientMock())
          .provideValue('github', createGhClientMock()),
      );

      const output = await service.verifyToken(input);

      expect(output).toEqual({
        ok: false,
        data: {
          error: 'token is broken',
        },
      });
    });

    test('failure - not found token', async () => {
      const data = {
        installation_id: 12345,
        owner: 'acot-a11y',
        repo: 'acot',
      };

      const service = createAppService(
        createLoggerMock(),
        createDriverRegistryMock()
          .provideValue(
            'crypto',
            createCryptoClientMock({
              decrypt: jest.fn().mockReturnValueOnce(JSON.stringify(data)),
            }),
          )
          .provideValue(
            'datastore',
            createDatastoreClientMock({
              get: jest.fn().mockImplementationOnce((v) => {
                if (v[1] === `${data.owner},${data.repo}`) {
                  return {
                    token: 'foobarbaz',
                  };
                }
                return {
                  token: '',
                };
              }),
            }),
          )
          .provideValue('github', createGhClientMock()),
      );

      const output = await service.verifyToken(input);

      expect(output).toEqual({
        ok: false,
        data: {
          error: 'invalid token',
        },
      });
    });

    test('failure - invalid token', async () => {
      const logger = createLoggerMock();

      const service = createAppService(
        logger,
        createDriverRegistryMock()
          .provideValue(
            'crypto',
            createCryptoClientMock({
              decrypt: jest.fn().mockImplementationOnce(() => {
                throw new Error('test');
              }),
            }),
          )
          .provideValue('datastore', createDatastoreClientMock())
          .provideValue('github', createGhClientMock()),
      );

      const output = await service.verifyToken(input);

      expect(output).toEqual({
        ok: false,
        data: {
          error: 'test',
        },
      });

      expect(logger.error).toBeCalled();
    });
  });

  describe('revokeToken', () => {
    const input = {
      token: 'token',
    };

    test('success', async () => {
      const data = {
        installation_id: 12345,
        owner: 'acot-a11y',
        repo: 'acot',
      };

      const service = createAppService(
        createLoggerMock(),
        createDriverRegistryMock()
          .provideValue(
            'crypto',
            createCryptoClientMock({
              decrypt: jest.fn().mockReturnValueOnce(JSON.stringify(data)),
            }),
          )
          .provideValue('datastore', createDatastoreClientMock())
          .provideValue('github', createGhClientMock()),
      );

      const output = await service.revokeToken(input);

      expect(output).toEqual({
        ok: true,
        data: {
          ok: true,
        },
      });
    });
  });
});
