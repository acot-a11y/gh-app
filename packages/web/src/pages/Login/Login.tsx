import { Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useAuth } from '../../states/auth';

export type Props = {};

export const Login: React.VFC<Props> = () => {
  const { login } = useAuth();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      login();
    },
    [login],
  );

  return (
    <Container>
      <VStack spacing="5">
        <Heading as="h2" size="2xl" textAlign="center">
          acot token manager
        </Heading>

        <Text align="center">
          Sign in and list the repositories where you have installed the
          acot-a11y GitHub App.
          <br />
          Select the target repository and management the token.
        </Text>

        <Button colorScheme="blue" onClick={handleClick}>
          Sign In
        </Button>
      </VStack>
    </Container>
  );
};
