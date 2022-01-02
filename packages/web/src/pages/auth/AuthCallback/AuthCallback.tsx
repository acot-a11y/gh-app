import { useAuthCallback } from '../../../states/auth';

export type Props = {};

export const AuthCallback: React.VFC<Props> = () => {
  useAuthCallback();

  return null;
};
