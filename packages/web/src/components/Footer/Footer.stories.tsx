import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { Footer } from '.';

export default {
  title: 'Footer',
  component: Footer,
} as ComponentMeta<typeof Footer>;

const defaultProps = {};

const Template: ComponentStory<typeof Footer> = (args) => <Footer {...args} />;

export const Overview = Template.bind({});
Overview.args = {
  ...defaultProps,
};
