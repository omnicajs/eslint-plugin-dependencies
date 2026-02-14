/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 37b7de36139fd321dd947dcefceb67b6d780c126 License: MIT Local changes:
 * fork-native test coverage derived from upstream rule behavior.
 */
import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema'

import { describe, expect, it } from 'vitest'

import { validateRuleJsonSchema } from './validate-rule-json-schema'
import rule from '../../rules/sort-imports'

describe('validate-rule-json-schema', () => {
  it('supports array input with multiple schemas', async () => {
    let schema = rule.meta.schema as JSONSchema4

    await expect(
      validateRuleJsonSchema([schema, schema]),
    ).resolves.not.toThrowError()
  })
})
