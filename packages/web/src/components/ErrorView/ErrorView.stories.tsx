import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { ErrorView } from '.';

export default {
  title: 'ErrorView',
  component: ErrorView,
} as ComponentMeta<typeof ErrorView>;

const Template: ComponentStory<typeof ErrorView> = (args) => (
  <ErrorView {...args} />
);

export const Overview = Template.bind({});
Overview.args = {
  message: 'error message',
};

export const WithoutMessage = Template.bind({});
WithoutMessage.args = {
  message: null,
};
