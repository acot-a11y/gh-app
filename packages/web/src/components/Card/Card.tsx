import type { HTMLChakraProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';

export type Props = HTMLChakraProps<'div'>;

export const Card: React.FC<Props> = ({ children, ...rest }) => {
  return (
    <Box
      as="div"
      borderWidth="1px"
      borderRadius="lg"
      p="4"
      listStyleType="none"
      shadow="sm"
      {...rest}
    >
      {children}
    </Box>
  );
};
