---
title: import-style
description: Enforce consistent formatting for import declarations by collapsing safe single-line imports.
shortDescription: Enforce consistent import formatting
keywords:
  - eslint
  - import formatting
  - eslint rule
  - code style
  - code quality
  - javascript linting
  - import declarations
---
Enforce consistent formatting for import declarations.

This rule collapses multi-line named imports into a single line when the
resulting statement is short enough and has a small number of specifiers. It
skips imports that contain comments inside the named specifier block.

## Try it out

### Before

```tsx
import type {
  TypeA,
} from './types'

import {
  valueA,
  valueB,
} from './mod'
```
### After (Alphabetical)

```tsx
import type { TypeA } from './types'

import { valueA, valueB } from './mod'
```
### After (Line Length)

```tsx
import type { TypeA } from './types'

import { valueA, valueB } from './mod'
```

## Options

This rule accepts an options object with the following properties:

### forceSingleLine

<sub>default: `true`</sub>

Controls whether multi-line imports are collapsed into single lines.

### maxSingleLineLength

<sub>default: `120`</sub>

Sets the maximum total length (including indentation) allowed for a single-line
import statement.

### maxSingleLineSpecifiers

<sub>default: `3`</sub>

Sets the maximum number of specifiers allowed in a single-line import
statement.

### singleLineSpacing

<sub>default: `true`</sub>

Controls spacing inside braces for single-line imports. When set to `false`,
the rule emits `{a}` instead of `{ a }`.
