/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { describe, expect, it } from 'vitest'

import { UnreachableCaseError } from '../../utils/unreachable-case-error'

describe('unreachable-case-error', () => {
  it('should construct the error with the correct message', () => {
    expect(() => {
      throw new UnreachableCaseError('Case that could not be reached' as never)
    }).toThrowError('Unreachable case: Case that could not be reached')
  })
})
