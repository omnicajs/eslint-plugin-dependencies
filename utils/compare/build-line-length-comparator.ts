/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import type { Comparator } from './default-comparator-by-options-computer'
import type { CommonOptions } from '../../types/common-options'
import type { SortingNode } from '../../types/sorting-node'

import { computeOrderedValue } from './compute-ordered-value'

/**
 * Creates a comparator function that sorts nodes by their line length.
 *
 * @param options - Options containing the sort order.
 * @param options.order - The order direction ('asc' or 'desc').
 * @returns A comparator function that compares two sorting nodes by their size.
 */
export function buildLineLengthComparator({
  order,
}: Pick<CommonOptions, 'order'>): Comparator<SortingNode> {
  return (a, b) => {
    let aSize = a.size
    let bSize = b.size

    let result = aSize - bSize
    return computeOrderedValue(result, order)
  }
}
