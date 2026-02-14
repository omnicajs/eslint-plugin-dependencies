/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import { describe, expect, it } from 'vitest'

import { isGroupWithOverridesOption } from '../../utils/is-group-with-overrides-option'

describe('is-group-with-overrides-option', () => {
  it.each([{ group: 'group' }, { group: ['group'] }])(
    'should return `true` if the element is a group with overrides option (%s)',
    (option: { group: string[] | string }) => {
      expect(isGroupWithOverridesOption(option)).toBeTruthy()
    },
  )

  it.each(['group', ['group'], {}, { foo: 'bar' }, { newlinesBetween: 1 }])(
    'should return `false` if the element is not a group with overrides option (%s)',
    option => {
      expect(
        isGroupWithOverridesOption(option as unknown as string),
      ).toBeFalsy()
    },
  )
})
