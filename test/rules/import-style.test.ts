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
        errors: [
          { messageId: 'formatImport' },
          { messageId: 'formatImport' },
        ],
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
})
