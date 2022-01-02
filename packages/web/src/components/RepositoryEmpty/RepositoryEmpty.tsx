import { Box, Button, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import { LogoIcon } from '../icons/LogoIcon';
import { Link } from '../Link';

export type Props = {};

export const RepositoryEmpty: React.FC<Props> = () => {
  return (
    <VStack my="12" spacing="4">
      <Icon as={LogoIcon} boxSize="120px" color="gray.300" />

      <Box>
        <Heading as="h2" size="lg" textAlign="center">
          No Installed Repositories Yet!
        </Heading>

        <Text align="center" mt="1">
          By installing the acot-a11y GitHub app, the repository will be
          displayed on this page.
        </Text>
      </Box>

      <Button
        as={Link}
        colorScheme="blue"
        to="https://github.com/apps/acot-a11y/installations/new"
      >
        Configure
      </Button>
    </VStack>
  );
};
