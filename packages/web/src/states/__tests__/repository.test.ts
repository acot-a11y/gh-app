import type { DeepPartial } from '@chakra-ui/react';
import { act } from '@testing-library/react-hooks';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { GhRepository } from '../../drivers/github';
import { createApiClientMock } from '../../drivers/__mocks__/api';
import { createGhClientMock } from '../../drivers/__mocks__/github';
import { renderRecoilHook } from '../../__tests__/hooks';
import { tokenState } from '../auth';
import { apiClientState, ghClientState } from '../driver';
import type { InstalledRepository } from '../repository';
import {
  useAppToken,
  useInstalledRepositoryList,
  useRegenerateAppToken,
} from '../repository';

const createGhRepository = (
  partial: DeepPartial<GhRepository> = {},
): GhRepository => ({
  id: 0,
  name: '',
  full_name: '',
  description: '',
  private: false,
  html_url: '',
  ...partial,
  owner: {
    id: 0,
    login: '',
    avatar_url: '',
    ...(partial.owner ?? {}),
  },
});

const createInstalledRepository = (
  partial: Partial<InstalledRepository> = {},
): InstalledRepository => ({
  id: 0,
  installationId: 0,
  owner: '',
  name: '',
  full: '',
  avatar: '',
  description: '',
  private: false,
  url: '',
  ...partial,
});

describe('states/repository', () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe('useInstalledRepositoryList', () => {
    test('with loggedIn', async () => {
      const { result, waitForNextUpdate } = renderRecoilHook(
        () => useInstalledRepositoryList(),
        {
          states: [
            [tokenState, 'token'],
            [
              ghClientState,
              createGhClientMock({
                getInstallationList: vi.fn().mockResolvedValueOnce({
                  installations: [{ id: 'id1' }, { id: 'id2' }],
                }),
                getRepositoryListByInstallationId: vi.fn((payload) => {
                  switch (payload.installation_id) {
                    case 'id1':
                      return {
                        total_count: 1,
                        repositories: [createGhRepository({ id: 1 })],
                      };
                    case 'id2':
                      return {
                        total_count: 1,
                        repositories: [createGhRepository({ id: 2 })],
                      };
                    default:
                      throw new Error('test');
                  }
                }),
              }),
            ],
          ],
        },
      );

      await waitForNextUpdate();

      expect(result.current).toEqual([
        expect.objectContaining({
          id: 1,
        }),
        expect.objectContaining({
          id: 2,
        }),
      ]);
    });

    test('with guest', async () => {
      const github = createGhClientMock();

      const { result, waitForNextUpdate } = renderRecoilHook(
        () => useInstalledRepositoryList(),
        {
          states: [
            [tokenState, null],
            [ghClientState, github],
          ],
        },
      );

      await waitForNextUpdate();

      expect(result.current).toEqual([]);
      expect(github.getInstallationList).not.toBeCalled();
      expect(github.getRepositoryListByInstallationId).not.toBeCalled();
    });
  });

  describe('useAppToken / useRegenerateAppToken', () => {
    test('with loggedIn', async () => {
      const repo = createInstalledRepository({
        id: 1,
      });

      const { result, waitForNextUpdate } = renderRecoilHook(
        () => ({
          token: useAppToken(repo),
          regenerate: useRegenerateAppToken(repo),
        }),
        {
          states: [
            [tokenState, 'token'],
            [
              apiClientState,
              createApiClientMock({
                generateAppToken: vi.fn().mockResolvedValueOnce({
                  token: 'app',
                }),
              }),
            ],
          ],
        },
      );

      await waitForNextUpdate();

      expect(result.current.token.contents).toBeNull();

      act(() => {
        result.current.regenerate();
      });

      await waitForNextUpdate();

      expect(result.current.token.contents).toBe('app');
    });
  });
});
