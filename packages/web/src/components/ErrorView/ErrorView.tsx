import { WarningTwoIcon } from '@chakra-ui/icons';
import {
  Button,
  Box,
  Container,
  Flex,
  Heading,
  Icon,
  Text,
} from '@chakra-ui/react';
import { useCallback } from 'react';

export type Props = {
  message: string | null;
};

export const ErrorView: React.FC<Props> = ({ message }) => {
  const handleClick = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <Flex h="100vh" align="center" justify="center">
      <Container>
        <Box maxW="600px" mx="auto">
          <Flex align="center">
            <Icon
              aria-hidden
              as={WarningTwoIcon}
              w="2rem"
              h="2rem"
              color="gray.300"
            />

            <Heading as="h1" size="lg" ml="2">
              Oops, Error Occurred
            </Heading>
          </Flex>

          <Text mt="2">
            An unexpected error has occurred. If reloading the page does not
            improve the situation, please contact the developer.
          </Text>

          {message && (
            <Text mt="1">
              Error Details:{' '}
              <Text as="span" color="red.400" fontWeight="bold">
                {message}
              </Text>
            </Text>
          )}

          <Button mt="4" onClick={handleClick}>
            Reload
          </Button>
        </Box>
      </Container>
    </Flex>
  );
};
