/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { describe, expect, it } from 'vitest'

import { validateObjectsInsideGroups } from '../../utils/validate-objects-inside-groups'

describe('validate-objects-inside-groups', () => {
  it('does not throw an error with consecutive objects-based elements', () => {
    expect(() => {
      validateObjectsInsideGroups({
        groups: [
          'a',
          ['b'],
          ['c'],
          { commentAbove: 'foo', group: 'd' },
          { commentAbove: 'bar', group: ['e'] },
        ],
      })
    }).not.toThrowError()
  })

  it('throws an error with consecutive non-groups objects-based elements', () => {
    expect(() => {
      validateObjectsInsideGroups({
        groups: ['a', { newlinesBetween: 1 }, { newlinesBetween: 1 }, ['b']],
      })
    }).toThrowError('Consecutive `newlinesBetween` objects are not allowed')
  })
})
