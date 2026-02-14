/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import type { TSESTree } from '@typescript-eslint/types'

/**
 * Check if a range contains another range.
 *
 * @param includingRange - The range that may include the other range.
 * @param subRange - The range to check if it is included.
 * @returns True if the includingRange contains the subRange, false otherwise.
 */
export function rangeContainsRange(
  includingRange: TSESTree.Range,
  subRange: TSESTree.Range,
): boolean {
  return includingRange[0] <= subRange[0] && includingRange[1] >= subRange[1]
}
