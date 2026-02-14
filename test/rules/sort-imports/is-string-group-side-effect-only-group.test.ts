/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import { describe, expect, it } from 'vitest'

import { isStringGroupSideEffectOnlyGroup } from '../../../rules/sort-imports/is-string-group-side-effect-only-group'

describe('is-string-group-side-effect-only-group', () => {
  it.each(['side-effect', 'side-effect-style'])(
    "should return true if groupName is '%s'",
    groupName => {
      expect(isStringGroupSideEffectOnlyGroup(groupName)).toBeTruthy()
    },
  )

  it('should return false otherwise', () => {
    expect(isStringGroupSideEffectOnlyGroup('other-group')).toBeFalsy()
  })
})
