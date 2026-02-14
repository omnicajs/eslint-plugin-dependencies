/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { describe, expect, it } from 'vitest'

import { validateNoDuplicatedGroups } from '../../utils/validate-no-duplicated-groups'

describe('validate-no-duplicated-groups', () => {
  it('throws an error if a duplicate group is provided', () => {
    expect(() =>
      validateNoDuplicatedGroups({
        groups: [
          ['group1'],
          'group2',
          'group3',
          'group4',
          { newlinesBetween: 1 },
          'group1',
          'group2',
          { commentAbove: 'comment', group: 'group3' },
          { commentAbove: 'comment', group: ['group4'] },
        ],
      }),
    ).toThrowError('Duplicated group(s): group1, group2, group3, group4')
  })
})
