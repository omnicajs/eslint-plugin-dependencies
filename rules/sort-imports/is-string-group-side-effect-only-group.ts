/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
/**
 * Checks if a group name represents a side-effect-only import group.
 *
 * Side-effect-only groups are 'side-effect' and 'side-effect-style', which
 * contain imports executed only for their side effects without bindings.
 *
 * @param groupName - The group name to check.
 * @returns True if the group is a side-effect-only group.
 */
export function isStringGroupSideEffectOnlyGroup(groupName: string): boolean {
  return groupName === 'side-effect' || groupName === 'side-effect-style'
}
