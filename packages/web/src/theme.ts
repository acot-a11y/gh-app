import { extendTheme } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools';

export const theme = extendTheme({
  styles: {
    global: {
      'html, body, #root': {
        height: '100%',
      },
    },
  },
  breakpoints: createBreakpoints({
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }),
  colors: {
    blue: {
      50: '#dfe6fa',
      100: '#cbd6f2',
      200: '#a2b7ed',
      300: '#7e9be3',
      400: '#6082d9',
      500: '#2051cd',
      600: '#113eaf',
      700: '#0b3193',
      800: '#08287a',
      900: '#011e68',
    },
  },
  components: {
    Container: {
      baseStyle: {
        maxWidth: {
          base: 'auto',
          sm: '768px',
          xl: '1136px',
        },
      },
    },
    Button: {
      baseStyle: {
        'a&': {
          _hover: {
            textDecoration: 'none',
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        header: {
          py: 6,
        },
        body: {
          py: 0,
        },
        footer: {
          py: 6,
        },
      },
    },
  },
});
