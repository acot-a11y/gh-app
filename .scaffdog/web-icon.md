---
name: 'web-icon'
root: 'packages/web/src/components/icons'
output: '.'
questions:
  name: 'Please enter a icon name.'
---

# Variables

- name: `{{ inputs.name | pascal }}Icon`

# `{{ name }}.tsx`

```typescript
export type Props = React.ComponentPropsWithoutRef<'svg'>;

export const {{ name }}: React.VFC<Props> = (props) => (
  <svg viewBox='0 0 20 20' {...props}>
    <path
      fill="currentColor"
      d="..."
    />
  </svg>
)
```
