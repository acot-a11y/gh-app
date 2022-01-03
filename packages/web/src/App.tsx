import { Box, Flex, useBoolean } from '@chakra-ui/react';
import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-location';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorView } from './components/ErrorView';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
// import { GuestRoute, PrivateRoute } from './routing';
import { useAuth, useInitializeAuth } from './states/auth';

const Inner: React.VFC = () => {
  const { loggedIn } = useInitializeAuth();
  const { login, logout } = useAuth();

  return (
    <Flex direction="column" minH="100%">
      <Header loggedIn={loggedIn} onSignIn={login} onSignOut={logout} />

      <Box flex="1 0 auto" mt="6" mb="12">
        <Outlet />
      </Box>

      <Box flex="0 0 auto" py="12">
        <Footer />
      </Box>
    </Flex>
  );
};

const DelayedFallback: React.FC = ({ children }) => {
  const [show, setShow] = useBoolean(false);

  useEffect(() => {
    const id = setTimeout(setShow.on, 300);

    return () => {
      clearTimeout(id);
    };
  }, [setShow.on]);

  return <>{show && children}</>;
};

export const App: React.VFC = () => {
  return (
    <ErrorBoundary view={ErrorView}>
      <Suspense
        fallback={
          <DelayedFallback>
            <LoadingScreen />
          </DelayedFallback>
        }
      >
        <Inner />
      </Suspense>
    </ErrorBoundary>
  );
};
