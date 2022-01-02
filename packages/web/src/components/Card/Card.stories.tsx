import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { Card } from '.';

export default {
  title: 'Card',
  component: Card,
} as ComponentMeta<typeof Card>;

const defaultProps = {};

const Template: ComponentStory<typeof Card> = (args) => <Card {...args} />;

export const Overview = Template.bind({});
Overview.args = {
  ...defaultProps,
  children: <div>Card</div>,
};
