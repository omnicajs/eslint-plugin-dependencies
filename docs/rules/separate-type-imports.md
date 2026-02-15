---
title: separate-type-imports
description:
  Require splitting mixed type/value named imports and normalize type-only
  imports to `import type`.
shortDescription: Require separate declarations for type imports
keywords:
  - eslint
  - typescript
  - import type
  - eslint rule
  - code style
  - import declarations
---

Require separating inline type imports from value imports.

This rule targets mixed imports like `import { foo, type Bar } from './mod'`. It
auto-fixes them into two declarations and enforces `import type` for type-only
named imports.

## Try it out

### Before

```ts
import React, { type FC, useState } from 'react'
import { type User, type Profile } from './types'
```

### After

```ts
import type { FC } from 'react'

import React, { useState } from 'react'
import type { User, Profile } from './types'
```

## Options

This rule accepts an options object with the following properties:

```ts
// Contract snapshot (defaults)
{
  order: 'type-first',
  blankLine: 'always',
}
```

### order

<sub>default: `'type-first'`</sub>

Controls whether the type import goes before or after the value import when a
mixed declaration is split.

- `'type-first'` - place `import type ...` before the value import.
- `'value-first'` - place value import before `import type ...`.

### blankLine

<sub>default: `'always'`</sub>

Controls spacing between the generated type and value declarations.

- `'always'` - insert one blank line between declarations.
- `'never'` - keep declarations adjacent with no blank line.

## Resources

- [Rule source](../../rules/separate-type-imports.ts)
- [Test source](../../test/rules/separate-type-imports.test.ts)
