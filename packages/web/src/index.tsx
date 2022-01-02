import { ChakraProvider } from '@chakra-ui/react';
import { StrictMode, useEffect } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecoilRoot, useRecoilSnapshot } from 'recoil';
import { App } from './App';
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

render(
  <StrictMode>
    <RecoilRoot>
      <Router>
        {process.env.NODE_ENV !== 'production' && <DebugObserver />}

        <ChakraProvider theme={theme}>
          <App />
        </ChakraProvider>
      </Router>
    </RecoilRoot>
  </StrictMode>,
  document.getElementById('root'),
);
