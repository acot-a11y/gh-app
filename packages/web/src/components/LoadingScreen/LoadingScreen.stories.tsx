import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { LoadingScreen } from '.';

export default {
  title: 'LoadingScreen',
  component: LoadingScreen,
} as ComponentMeta<typeof LoadingScreen>;

const defaultProps = {};

const Template: ComponentStory<typeof LoadingScreen> = (args) => (
  <LoadingScreen {...args} />
);

export const Overview = Template.bind({});
Overview.args = {
  ...defaultProps,
};
