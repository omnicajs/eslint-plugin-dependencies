/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { describe, expect, it } from 'vitest'

import { computeGroupName } from '../../utils/compute-group-name'

describe('computeGroupName', () => {
  it("should return the group if it's a string", () => {
    expect(computeGroupName('foo')).toBe('foo')
  })

  it('should return null if the group is an array', () => {
    expect(computeGroupName(['foo'])).toBeNull()
  })

  describe('when the group is a comment above object', () => {
    it("should return the group if it's a string", () => {
      expect(computeGroupName({ commentAbove: 'foo', group: 'foo' })).toBe(
        'foo',
      )
    })

    it('should return null if the group is an array', () => {
      expect(
        computeGroupName({ group: ['foo', 'bar'], commentAbove: 'foo' }),
      ).toBeNull()
    })
  })

  it('should return null if the group is a newlinesBetween object', () => {
    expect(computeGroupName({ newlinesBetween: 1 })).toBeNull()
  })
})
