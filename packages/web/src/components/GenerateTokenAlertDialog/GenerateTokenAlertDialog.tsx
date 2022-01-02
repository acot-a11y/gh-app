import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  VStack,
  Box,
  AlertDialogFooter,
  HStack,
  Button,
  AlertDialogCloseButton,
  Text,
} from '@chakra-ui/react';
import { useCallback, useRef } from 'react';
import { Link } from '../Link';

export type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPrimary: () => void;
};

export const GenerateTokenAlertDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onPrimary,
}) => {
  const cancelRef = useRef(null);

  const handleCancelClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onClose();
    },
    [onClose],
  );

  const handlePrimaryClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onPrimary();
    },
    [onPrimary],
  );

  return (
    <AlertDialog
      isCentered
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      size="lg"
      onClose={onClose}
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>Generate Token</AlertDialogHeader>

        <AlertDialogBody>
          <VStack spacing="4" align="stretch">
            <Text align="left">
              Generate the token for{' '}
              <Link
                to="https://github.com/acot-a11y/acot/tree/canary/packages/acot-reporter-github"
                fontWeight="bold"
              >
                acot-reporter-github
              </Link>
              .
            </Text>

            <Box>
              <Text as="h3" fontWeight="bold">
                If this is your first time generating token:
              </Text>
              <Text>
                A new token will be generated. Note that the generated token
                will only be displayed once.
              </Text>
            </Box>

            <Box>
              <Text as="h3" fontWeight="bold">
                If you've already generated a token:
              </Text>
              <Text>
                The previously generated token will be invalidated and a new
                token will be generated. Note that previous tokens will no
                longer be available.
              </Text>
            </Box>
          </VStack>
        </AlertDialogBody>

        <AlertDialogFooter>
          <HStack spacing="3">
            <Button variant="ghost" onClick={handleCancelClick}>
              Cancel
            </Button>

            <Button colorScheme="blue" onClick={handlePrimaryClick}>
              Generate
            </Button>
          </HStack>
        </AlertDialogFooter>

        <AlertDialogCloseButton />
      </AlertDialogContent>
    </AlertDialog>
  );
};
