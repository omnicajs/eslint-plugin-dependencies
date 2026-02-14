/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { describe, expect, it } from 'vitest'
import Ajv from 'ajv-draft-04'

import { partitionByCommentJsonSchema } from '../../../utils/json-schemas/common-partition-json-schemas'

describe('common-partition-json-schemas', () => {
  describe('partitionByComment', () => {
    let partitionByCommentJsonSchemaValidator = new Ajv().compile(
      partitionByCommentJsonSchema,
    )

    it('should allow boolean values', () => {
      expect(partitionByCommentJsonSchemaValidator(true)).toBeTruthy()
    })

    it.each([{ block: true }, { line: true }, { block: true, line: true }])(
      "should allow '%s'",
      partitionByComment => {
        expect(
          partitionByCommentJsonSchemaValidator(partitionByComment),
        ).toBeTruthy()
      },
    )

    it('should not allow the empty object', () => {
      expect(partitionByCommentJsonSchemaValidator({})).toBeFalsy()
    })
  })
})
