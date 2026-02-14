/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
/**
 * Checks if a node is sortable (i.e., an array with more than one element).
 *
 * @param node - The node to check.
 * @returns True if the node is sortable, false otherwise.
 */
export function isSortable(node: unknown): node is unknown[] {
  return Array.isArray(node) && node.length > 1
}
