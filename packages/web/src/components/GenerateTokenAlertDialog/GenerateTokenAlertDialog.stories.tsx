import { Button, useBoolean } from '@chakra-ui/react';
import { action } from '@storybook/addon-actions';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { GenerateTokenAlertDialog } from '.';

export default {
  title: 'GenerateTokenAlertDialog',
  component: GenerateTokenAlertDialog,
} as ComponentMeta<typeof GenerateTokenAlertDialog>;

const defaultProps = {
  isOpen: false,
  onClose: action('onClose'),
  onPrimary: action('onPrimary'),
};

const Template: ComponentStory<typeof GenerateTokenAlertDialog> = (args) => {
  const [isOpen, setIsOpen] = useBoolean(args.isOpen);

  return (
    <>
      <Button onClick={setIsOpen.on}>Open</Button>

      <GenerateTokenAlertDialog
        {...args}
        isOpen={isOpen}
        onClose={setIsOpen.off}
        onPrimary={setIsOpen.off}
      />
    </>
  );
};

export const Overview = Template.bind({});
Overview.args = {
  ...defaultProps,
};

export const WithOpen = Template.bind({});
WithOpen.args = {
  ...defaultProps,
  isOpen: true,
};
