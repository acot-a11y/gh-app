import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
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

export const decorators = [
  (story) => (
    <MemoryRouter>
      <ChakraProvider theme={theme}>{story()}</ChakraProvider>
    </MemoryRouter>
  ),
];
