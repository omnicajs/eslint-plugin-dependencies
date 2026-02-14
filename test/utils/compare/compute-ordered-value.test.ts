/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { describe, expect, it } from 'vitest'

import { computeOrderedValue } from '../../../utils/compare/compute-ordered-value'

describe('compute-ordered-value', () => {
  it("returns the value if order is 'asc'", () => {
    let result = computeOrderedValue(42, 'asc')

    expect(result).toBe(42)
  })

  it("returns the negated value if order is 'desc'", () => {
    let result = computeOrderedValue(42, 'desc')

    expect(result).toBe(-42)
  })
})
