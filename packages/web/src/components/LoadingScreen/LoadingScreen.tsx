import { Center, Spinner } from '@chakra-ui/react';

export type Props = {};

export const LoadingScreen: React.VFC<Props> = () => {
  return (
    <Center w="100vw" h="100vh">
      <Spinner color="blue" size="lg" />
    </Center>
  );
};
