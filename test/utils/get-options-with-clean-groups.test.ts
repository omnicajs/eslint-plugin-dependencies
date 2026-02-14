/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { describe, expect, it } from 'vitest'

import { getOptionsWithCleanGroups } from '../../utils/get-options-with-clean-groups'

describe('get-options-with-cleaned-groups', () => {
  it('get options with cleaned groups', () => {
    expect(
      getOptionsWithCleanGroups({
        groups: [
          'predefinedGroup',
          [],
          ['customGroup', 'group1'],
          ['singleGroup'],
          'group2',
        ],
      }),
    ).toStrictEqual({
      groups: [
        'predefinedGroup',
        ['customGroup', 'group1'],
        'singleGroup',
        'group2',
      ],
    })
  })
})
