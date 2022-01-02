import {
  Avatar,
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spinner,
  Stack,
  Text,
  useClipboard,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { Suspense, useCallback } from 'react';
import { Card } from '../../components/Card';
import { GenerateTokenAlertDialog } from '../../components/GenerateTokenAlertDialog';
import { Link } from '../../components/Link';
import { RepositoryEmpty } from '../../components/RepositoryEmpty';
import type { InstalledRepository } from '../../states/repository';
import {
  useAppToken,
  useInstalledRepositoryList,
  useRegenerateAppToken,
} from '../../states/repository';

const $List: React.FC<React.ComponentProps<typeof VStack>> = ({
  children,
  ...rest
}) => {
  return (
    <VStack align="stretch" spacing="4" mt="6" {...rest}>
      {children}
    </VStack>
  );
};

const RepositoryListItem: React.VFC<{
  repo: InstalledRepository;
}> = ({ repo }) => {
  const {
    isOpen: isDialogOpen,
    onOpen: onDialogOpen,
    onClose: onDialogClose,
  } = useDisclosure();

  const { isOpen: isCollapseOpen, onOpen: onCollapseOpen } = useDisclosure();

  const token = useAppToken(repo);
  const tokenText = token.state === 'hasValue' ? token.contents ?? '' : '';
  const regenerate = useRegenerateAppToken(repo);
  const { hasCopied, onCopy } = useClipboard(tokenText);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onDialogOpen();
    },
    [onDialogOpen],
  );

  const handleGenerate = useCallback(() => {
    onCollapseOpen();
    onDialogClose();
    regenerate();
  }, [onDialogClose, onCollapseOpen, regenerate]);

  const handleInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.select();
    },
    [],
  );

  return (
    <Card as="li" listStyleType="none">
      <Stack
        spacing="4"
        align={{ md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
      >
        <Flex flex="1 1 auto" align="center">
          <Box flex="0 0 auto">
            <Avatar boxSize="44px" name={repo.owner} src={repo.avatar} />
          </Box>

          <Box flex="1 1 auto" ml="2">
            <Link to={repo.url} fontSize="xl" fontWeight="bold">
              {repo.name}
            </Link>

            <Text fontSize="xs" color="gray.500">
              {repo.owner}
            </Text>
          </Box>
        </Flex>

        <Box flex="0 0 auto">
          <Button isFullWidth onClick={handleClick}>
            Generate Token
          </Button>
        </Box>
      </Stack>

      <Collapse animateOpacity in={isCollapseOpen}>
        <Divider mt="4" />

        <Box mt="4">
          <FormControl isInvalid={token.state === 'hasError'}>
            <FormLabel htmlFor="token">Token</FormLabel>

            <InputGroup>
              <Input
                readOnly
                isDisabled={token.state === 'loading'}
                id="token"
                type="text"
                variant="flushed"
                pr="5rem"
                value={tokenText}
                onFocus={handleInputFocus}
              />

              <InputRightElement w="5rem">
                {token.state === 'loading' ? (
                  <Spinner color="blue" />
                ) : (
                  <Button h="1.75rem" size="sm" onClick={onCopy}>
                    {hasCopied ? 'Copied' : 'Copy'}
                  </Button>
                )}
              </InputRightElement>
            </InputGroup>

            {token.state === 'hasError' ? (
              <FormErrorMessage>
                Error: {token.contents?.message}
              </FormErrorMessage>
            ) : (
              <FormHelperText>
                Note: The token will only be displayed once.
              </FormHelperText>
            )}
          </FormControl>
        </Box>
      </Collapse>

      <GenerateTokenAlertDialog
        isOpen={isDialogOpen}
        onClose={onDialogClose}
        onPrimary={handleGenerate}
      />
    </Card>
  );
};

const RepositoryList: React.VFC = () => {
  const list = useInstalledRepositoryList();

  if (list.length < 1) {
    return <RepositoryEmpty />;
  }

  return (
    <Box>
      <Heading as="h2" size="xl">
        Repository List
      </Heading>

      <Text mt="1">
        The repository list where the acot-a11y GitHub is installed.
      </Text>

      <$List as="ul">
        {list.map((repo) => (
          <RepositoryListItem key={repo.id} repo={repo} />
        ))}
      </$List>
    </Box>
  );
};

const SkeletonItem: React.VFC = () => {
  return (
    <Card>
      <Stack
        spacing="4"
        align={{ md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
      >
        <Flex flex="1 1 auto" align="center">
          <Box flex="0 0 auto">
            <SkeletonCircle size="44px" />
          </Box>

          <Box flex="1 0 auto" ml="2">
            <SkeletonText
              w={{ base: '100%', md: '12rem' }}
              noOfLines={2}
              spacing="2"
            />
          </Box>
        </Flex>

        <Box flex="0 0 auto">
          <Skeleton w={{ base: '100%', md: '9.5rem' }} h="2rem" />
        </Box>
      </Stack>
    </Card>
  );
};

const Loading: React.VFC = () => {
  return (
    <Box>
      <Skeleton w="16rem" h="3rem" />
      <SkeletonText mt="2" noOfLines={1} />

      <$List>
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </$List>
    </Box>
  );
};

export type Props = {};

export const Home: React.VFC<Props> = () => {
  return (
    <Container>
      <Suspense fallback={<Loading />}>
        <RepositoryList />
      </Suspense>
    </Container>
  );
};
