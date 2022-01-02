import { Container, IconButton, Text, VStack } from '@chakra-ui/react';
import { GitHubIcon } from '../icons/GitHubIcon';
import { Link } from '../Link';

export type Props = {};

export const Footer: React.FC<Props> = () => {
  return (
    <Container>
      <VStack spacing="1">
        <IconButton
          isRound
          as={Link}
          size="md"
          colorScheme="gray"
          variant="ghost"
          to="https://github.com/acot-a11y/gh-app"
          icon={<GitHubIcon width={24} height={24} />}
          aria-label="Go to GitHub"
        />

        <Text fontSize="xs">© 2022 acot-a11y</Text>
      </VStack>
    </Container>
  );
};
