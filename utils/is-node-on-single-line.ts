/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import type { TSESTree } from '@typescript-eslint/types'

/**
 * Returns if a node is on a single line.
 *
 * @param node - The node to check.
 * @returns True if the node is on a single line, false otherwise.
 */
export function isNodeOnSingleLine(node: TSESTree.Node): boolean {
  return node.loc.start.line === node.loc.end.line
}
