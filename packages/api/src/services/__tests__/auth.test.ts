import { createGhClientMock } from '../../drivers/__mocks__/github';
import { createDriverRegistryMock } from '../../drivers/__mocks__/registry';
import { createLoggerMock } from '../../__mocks__/logging';
import { createAuthService } from '../auth';

describe('AuthService', () => {
  describe('loginAsUser', () => {
    const input = {
      now: new Date(),
      code: 'code',
    };

    test('success', async () => {
      const service = createAuthService(
        createLoggerMock(),
        createDriverRegistryMock().provideValue(
          'github',
          createGhClientMock({
            exchangeCodeForToken: jest.fn().mockResolvedValueOnce({
              access_token: 'token',
              expires_in: 1992,
            }),
          }),
        ),
      );

      const output = await service.loginAsUser(input);

      expect(output).toEqual({
        ok: true,
        data: {
          token: 'token',
          expires_at: input.now.getTime() + 1992,
        },
      });
    });

    test('failure - invalid code', async () => {
      const service = createAuthService(
        createLoggerMock(),
        createDriverRegistryMock().provideValue(
          'github',
          createGhClientMock({
            exchangeCodeForToken: jest.fn().mockResolvedValueOnce({
              error: 'error',
              error_description: 'desc',
              error_uri: 'http://localhost:8000/error',
            }),
          }),
        ),
      );

      const output = await service.loginAsUser(input);

      expect(output).toEqual({
        ok: false,
        data: {
          error: 'desc (error)',
          help: 'http://localhost:8000/error',
        },
      });
    });

    test('failure - invalid request', async () => {
      const logger = createLoggerMock();

      const service = createAuthService(
        logger,
        createDriverRegistryMock().provideValue(
          'github',
          createGhClientMock({
            exchangeCodeForToken: jest
              .fn()
              .mockRejectedValueOnce(new Error('test')),
          }),
        ),
      );

      const output = await service.loginAsUser(input);

      expect(output).toEqual({
        ok: false,
        data: {
          error: 'test',
        },
      });

      expect(logger.error).toBeCalled();
    });
  });
});
