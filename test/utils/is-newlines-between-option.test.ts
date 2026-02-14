/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import { describe, expect, it } from 'vitest'

import { isNewlinesBetweenOption } from '../../utils/is-newlines-between-option'

describe('is-newlines-between-option', () => {
  it('should return `true` if the element is a newlines between option', () => {
    expect(
      isNewlinesBetweenOption({
        newlinesBetween: 'ignore',
      }),
    ).toBeTruthy()
  })

  it.each(['group', ['group'], {}, { foo: 'bar' }, { group: 'group' }])(
    'should return `false` if the element is not a newlines between option (%s)',
    option => {
      expect(isNewlinesBetweenOption(option as unknown as string)).toBeFalsy()
    },
  )
})
