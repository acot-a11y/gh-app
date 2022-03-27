import { ChakraProvider } from '@chakra-ui/react';
import { StrictMode, useEffect } from 'react';
import { render } from 'react-dom';
import type { Route } from 'react-location';
import { ReactLocation, Router } from 'react-location';
import { RecoilRoot, useRecoilSnapshot } from 'recoil';
import { App } from './App';
import { GuestRoute, PrivateRoute } from './routing';
import { theme } from './theme';

/* eslint-disable */
const DebugObserver: React.VFC = () => {
  const snapshot = useRecoilSnapshot();

  useEffect(() => {
    console.debug('The following atoms were modified:');
    for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      console.debug(node.key, snapshot.getLoadable(node));
    }
  }, [snapshot]);

  return null;
};
/* eslint-enable */

const location = new ReactLocation();

const route =
  (
    constraint: 'guest' | 'private' | 'all',
    fn: () => Promise<{ default: React.ComponentType }>,
  ) =>
  () =>
    fn().then((mod) => {
      switch (constraint) {
        case 'private':
          return (
            <PrivateRoute>
              <mod.default />
            </PrivateRoute>
          );
        case 'guest':
          return (
            <GuestRoute>
              <mod.default />
            </GuestRoute>
          );
        case 'all':
          return <mod.default />;
      }
    });

const routes: Route<{}>[] = [
  {
    path: '/',
    element: route('private', () => import('./pages/Home')),
  },
  {
    path: '/login',
    element: route('guest', () => import('./pages/Login')),
  },
  {
    path: '/auth/callback',
    element: route('all', () => import('./pages/auth/AuthCallback')),
  },
];

render(
  <StrictMode>
    <RecoilRoot>
      {process.env.NODE_ENV !== 'production' && <DebugObserver />}

      <ChakraProvider theme={theme}>
        <Router location={location} routes={routes}>
          <App />
        </Router>
      </ChakraProvider>
    </RecoilRoot>
  </StrictMode>,
  document.getElementById('root'),
);
