---
name: 'web-component'
root: 'packages/web/src/components'
output: '.'
questions:
  name: 'Please enter a component name.'
---

# Variables

- name: `{{ inputs.name | pascal }}`

# `{{ name }}/index.ts`

```typescript
export * from './{{ name }}';
```

# `{{ name }}/{{ name }}.tsx`

```typescript
export type Props = {};

export const {{ name }}: React.FC<Props> = () => {
  return (
    <div>
      TODO
    </div>
  );
}
```

# `{{ name }}/{{ name }}.stories.tsx`

```typescript
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { {{ name }} } from '.';

export default {
  title: '{{ name }}',
  component: {{ name }},
} as ComponentMeta<typeof {{ name }}>;

const defaultProps = {};

const Template: ComponentStory<typeof {{ name }}> = (args) => (
  <{{ name }} {...args} />
);

export const Overview = Template.bind({});
Overview.args = {
  ...defaultProps,
};
```
