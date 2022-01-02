import {
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { useCallback } from 'react';
import { LogoIcon } from '../icons/LogoIcon';
import { Link } from '../Link';

export type Props = {
  loggedIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
};

export const Header: React.FC<Props> = ({ loggedIn, onSignIn, onSignOut }) => {
  const handleSignInClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onSignIn();
    },
    [onSignIn],
  );

  const handleSignOutClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onSignOut();
    },
    [onSignOut],
  );

  return (
    <Container>
      <Flex align="center" py={{ base: '4', md: '8' }}>
        <Flex flex="1 0 auto">
          <Link to="/" borderRadius="md">
            <HStack spacing="2" align="center">
              <Icon as={LogoIcon} boxSize="32px" color="blue" />

              <Heading as="h1" size="md">
                acot
              </Heading>
            </HStack>
          </Link>
        </Flex>

        <HStack flex="0 1 auto" spacing={{ base: '1', sm: '2', md: '3' }}>
          <Button
            as={Link}
            size="sm"
            variant="ghost"
            to="https://github.com/apps/acot-a11y/installations/new"
          >
            Configure
          </Button>

          {loggedIn ? (
            <Button size="sm" onClick={handleSignOutClick}>
              Sign out
            </Button>
          ) : (
            <Button size="sm" onClick={handleSignInClick}>
              Sign in
            </Button>
          )}
        </HStack>
      </Flex>
    </Container>
  );
};
