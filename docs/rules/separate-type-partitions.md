---
title: separate-type-partitions
description:
  Require a blank-line partition between type-only imports and value imports
  inside each contiguous import block.
shortDescription: Require separate partitions for type imports
keywords:
  - eslint
  - typescript
  - import type
  - eslint rule
  - import declarations
  - code style
---

Require separate partitions for type-only and value imports.

Within a contiguous import block, this rule groups all `import type`
declarations together, groups value imports together, and enforces exactly one
blank line between these groups.

## Try it out

### Before

```ts
import React from 'react'
import type { FC } from 'react'
import { useState } from 'react'
import type { User } from './types'
```

### After

```ts
import type { FC } from 'react'
import type { User } from './types'

import React from 'react'
import { useState } from 'react'
```

## Options

This rule has no options.

## Resources

- [Rule source](../../rules/separate-type-partitions.ts)
- [Test source](../../test/rules/separate-type-partitions.test.ts)
