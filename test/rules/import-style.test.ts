import { createRuleTester } from 'eslint-vitest-rule-tester'
import typescriptParser from '@typescript-eslint/parser'
import { describe, it } from 'vitest'
import dedent from 'dedent'

import rule from '../../rules/import-style'

describe('import-style', () => {
  let { invalid, valid } = createRuleTester({
    parser: typescriptParser,
    name: 'import-style',
    rule,
  })

  describe('default behavior', () => {
    it('collapses multiline named imports when within limits', async () => {
      await invalid({
        code: dedent`
          import {
            foo,
            bar,
          } from './mod';
        `,
        output: dedent`
          import { foo, bar } from './mod';
        `,
        errors: [{ messageId: 'formatImport' }],
      })
    })

    it('collapses multiline type imports', async () => {
      await invalid({
        code: dedent`
          import type {
            Foo,
            Bar,
          } from './types';
        `,
        output: dedent`
          import type { Foo, Bar } from './types';
        `,
        errors: [{ messageId: 'formatImport' }],
      })
    })

    it('collapses multiline default and named imports', async () => {
      await invalid({
        code: dedent`
          import Foo, {
            bar,
          } from './mod';
        `,
        output: dedent`
          import Foo, { bar } from './mod';
        `,
        errors: [{ messageId: 'formatImport' }],
      })
    })

    it('collapses separate type and value imports', async () => {
      await invalid({
        code: dedent`
          import type {
            TypeA,
          } from './mod';

          import {
            valueA,
          } from './mod';
        `,
        output: dedent`
          import type { TypeA } from './mod';

          import { valueA } from './mod';
        `,
        errors: [{ messageId: 'formatImport' }, { messageId: 'formatImport' }],
      })
    })
  })

  describe('options', () => {
    it('removes brace spacing for single-line imports when configured', async () => {
      await invalid({
        code: dedent`
          import {
            foo,
            bar,
          } from './mod';
        `,
        output: dedent`
          import {foo, bar} from './mod';
        `,
        errors: [{ messageId: 'formatImport' }],
        options: [{ singleLineSpacing: false }],
      })
    })

    it('does not collapse when forceSingleLine is false', async () => {
      await valid({
        code: dedent`
          import {
            foo,
            bar,
          } from './mod';
        `,
        options: [{ forceSingleLine: false }],
      })
    })

    it('expands single-line named imports when forceSingleLine is false', async () => {
      await invalid({
        output: dedent`
          import {
            foo,
            bar
          } from './mod';
        `,
        code: dedent`
          import { foo, bar } from './mod';
        `,
        errors: [{ messageId: 'formatImport' }],
        options: [{ forceSingleLine: false }],
      })
    })

    it('does not collapse when maxSingleLineSpecifiers is exceeded', async () => {
      await valid({
        code: dedent`
          import {
            foo,
            bar,
          } from './mod';
        `,
        options: [{ maxSingleLineSpecifiers: 1 }],
      })
    })

    it('expands single-line imports when maxSingleLineSpecifiers is exceeded', async () => {
      await invalid({
        output: dedent`
          import {
            foo,
            bar
          } from './mod';
        `,
        code: dedent`
          import { foo, bar } from './mod';
        `,
        options: [{ maxSingleLineSpecifiers: 1 }],
        errors: [{ messageId: 'formatImport' }],
      })
    })

    it('does not collapse when maxSingleLineLength is exceeded', async () => {
      await valid({
        code: dedent`
          import {
            foo,
            bar,
          } from './long/module/path';
        `,
        options: [{ maxSingleLineLength: 30 }],
      })
    })

    it('expands single-line imports when maxSingleLineLength is exceeded', async () => {
      await invalid({
        output: dedent`
          import {
            foo,
            bar
          } from './long/module/path';
        `,
        code: dedent`
          import { foo, bar } from './long/module/path';
        `,
        errors: [{ messageId: 'formatImport' }],
        options: [{ maxSingleLineLength: 30 }],
      })
    })
  })

  describe('valid', () => {
    it('ignores imports without named specifiers', async () => {
      await valid({
        code: dedent`
          import Foo from './mod';
        `,
      })
    })

    it('skips collapsing when comments are present', async () => {
      await valid({
        code: dedent`
          import {
            foo,
            /* keep */
            bar,
          } from './mod';
        `,
      })
    })
  })

  describe('multiline format', () => {
    it('formats type imports with one specifier per line', async () => {
      await invalid({
        output: dedent`
          import type {
            FooType,
            BarType
          } from './types';
        `,
        code: dedent`
          import type { FooType,
            BarType } from './types';
        `,
        errors: [{ messageId: 'formatImport' }],
        options: [{ maxSingleLineLength: 20 }],
      })
    })

    it('removes blank lines inside named imports', async () => {
      await invalid({
        output: dedent`
          import {
            foo,
            bar
          } from './mod';
        `,
        code: dedent`
          import {

            foo,
            bar
          } from './mod';
        `,
        errors: [{ messageId: 'formatImport' }],
        options: [{ forceSingleLine: false }],
      })
    })

    it('uses the shortest detected indentation for multiline formatting', async () => {
      await invalid({
        output: dedent`
            // four
          // two
              // six
          import {
              foo,
              bar
          } from './mod';
        `,
        code: dedent`
            // four
          // two
              // six
          import { foo, bar } from './mod';
        `,
        errors: [{ messageId: 'formatImport' }],
        options: [{ forceSingleLine: false }],
      })
    })

    it('accepts correctly formatted multiline imports', async () => {
      await valid({
        code: dedent`
          import {
            foo,
            bar
          } from './mod';
        `,
        options: [{ forceSingleLine: false }],
      })
    })
  })
})
