/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import { describe, expect, it } from 'vitest'

import { isSideEffectOnlyGroup } from '../../../rules/sort-imports/is-side-effect-only-group'

describe('is-side-effect-only-group', () => {
  it('should return false if option is undefined', () => {
    expect(isSideEffectOnlyGroup(undefined)).toBeFalsy()
  })

  it('should return false if option is a newlinesBetween option', () => {
    expect(
      isSideEffectOnlyGroup({
        newlinesBetween: 'ignore',
      }),
    ).toBeFalsy()
  })

  it.each(['side-effect', 'side-effect-style'])(
    'should return true if option `%s`',
    group => {
      expect(isSideEffectOnlyGroup(group)).toBeTruthy()
    },
  )

  it('should return true if all elements of a subgroup is a side-effect group `%s`', () => {
    expect(
      isSideEffectOnlyGroup(['side-effect', 'side-effect-style']),
    ).toBeTruthy()
  })

  it.each(['side-effect', 'side-effect-style'])(
    'should return false if at least one element of a subgroup is not a side-effect group (`%s`)',
    group => {
      expect(isSideEffectOnlyGroup(['group1', group])).toBeFalsy()
    },
  )

  it.each(['side-effect', 'side-effect-style'])(
    'should return true if object-based option has group `%s`',
    group => {
      expect(
        isSideEffectOnlyGroup({
          commentAbove: 'foo',
          group,
        }),
      ).toBeTruthy()
    },
  )

  it('should return true if object-based option has all elements of group is a side-effect group', () => {
    expect(
      isSideEffectOnlyGroup({
        group: ['side-effect', 'side-effect-style'],
        commentAbove: 'foo',
      }),
    ).toBeTruthy()
  })

  it.each(['side-effect', 'side-effect-style'])(
    'should return false if object-based option has at least one element of a subgroup that is not a side-effect group (`%s`)',
    group => {
      expect(
        isSideEffectOnlyGroup({
          group: ['group1', group],
          commentAbove: 'foo',
        }),
      ).toBeFalsy()
    },
  )
})
