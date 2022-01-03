import { Box, Flex, useBoolean } from '@chakra-ui/react';
import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorView } from './components/ErrorView';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { GuestRoute, PrivateRoute } from './routing';
import { useAuth, useInitializeAuth } from './states/auth';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback'));

const Inner: React.VFC = () => {
  const { loggedIn } = useInitializeAuth();
  const { login, logout } = useAuth();

  return (
    <Flex direction="column" minH="100%">
      <Header loggedIn={loggedIn} onSignIn={login} onSignOut={logout} />

      <Box flex="1 0 auto" mt="6" mb="12">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />

          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
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
