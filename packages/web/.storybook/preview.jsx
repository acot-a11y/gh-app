import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { createMemoryHistory, ReactLocation, Router } from 'react-location';
import { theme } from '../src/theme';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const history = createMemoryHistory();
const location = new ReactLocation({ history });
const routes = [];

export const decorators = [
  (story) => (
    <Router location={location} routes={routes}>
      <ChakraProvider theme={theme}>{story()}</ChakraProvider>
    </Router>
  ),
];
