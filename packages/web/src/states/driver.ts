import { atom, useRecoilValue } from 'recoil';
import { createApiClient } from '../drivers/api';
import { createGhClient } from '../drivers/github';

// API
export const apiClientState = atom({
  key: 'driver/api',
  default: createApiClient(),
});

export const useApiClient = () => useRecoilValue(apiClientState);

// GitHub
export const ghClientState = atom({
  key: 'driver/github',
  default: createGhClient(),
});

export const useGhClient = () => useRecoilValue(ghClientState);
