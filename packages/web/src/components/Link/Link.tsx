import type { LinkProps as ChakraLinkProps } from '@chakra-ui/react';
import { Link as ChakraLink } from '@chakra-ui/react';
import { forwardRef } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

const EXTERNAL_LINK_REGEX = /^https?:\/\//;

export type Props = Omit<ChakraLinkProps, 'as' | 'href'> & RouterLinkProps;

export const Link = forwardRef<HTMLAnchorElement, Props>(
  ({ to, children, ...rest }, ref) => {
    const props = { to, ...rest };
    let component: ChakraLinkProps['as'] = RouterLink;

    if (typeof to === 'string' && EXTERNAL_LINK_REGEX.test(to)) {
      (props as any).href = to;
      component = 'a';
    }

    return (
      <ChakraLink ref={ref} {...props} as={component}>
        {children}
      </ChakraLink>
    );
  },
);
