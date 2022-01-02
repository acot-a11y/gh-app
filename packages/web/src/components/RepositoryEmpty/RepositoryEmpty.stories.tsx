import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { RepositoryEmpty } from '.';

export default {
  title: 'RepositoryEmpty',
  component: RepositoryEmpty,
} as ComponentMeta<typeof RepositoryEmpty>;

const defaultProps = {};

const Template: ComponentStory<typeof RepositoryEmpty> = (args) => (
  <RepositoryEmpty {...args} />
);

export const Overview = Template.bind({});
Overview.args = {
  ...defaultProps,
};
