/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import type { CommonOptions } from '../../types/common-options'

import { UnreachableCaseError } from '../unreachable-case-error'

/**
 * Adjusts a comparison result value based on the specified sort order.
 *
 * For ascending order, returns the value unchanged. For descending order,
 * negates the value to reverse the sort direction.
 *
 * @param value - The comparison result value to adjust.
 * @param order - The order direction ('asc' or 'desc').
 * @returns The adjusted comparison value.
 */
export function computeOrderedValue(
  value: number,
  order: CommonOptions['order'],
): number {
  switch (order) {
    case 'desc':
      return -value
    case 'asc':
      return value
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(order)
  }
}
