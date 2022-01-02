import { action } from '@storybook/addon-actions';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { Header } from '.';

export default {
  title: 'Header',
  component: Header,
} as ComponentMeta<typeof Header>;

const defaultProps = {
  loggedIn: true,
  onSignIn: action('onSignIn'),
  onSignOut: action('onSignOut'),
};

const Template: ComponentStory<typeof Header> = (args) => <Header {...args} />;

export const Overview = Template.bind({});
Overview.args = {
  ...defaultProps,
};

export const WithGuest = Template.bind({});
WithGuest.args = {
  ...defaultProps,
  loggedIn: false,
};
