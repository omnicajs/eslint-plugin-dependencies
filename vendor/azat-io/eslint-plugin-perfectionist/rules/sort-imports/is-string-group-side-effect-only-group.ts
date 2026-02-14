/* Authorship: Azat S. (https://github.com/azat-io). Source history: https://github.com/azat-io/eslint-plugin-perfectionist/commits/main/rules/sort-imports/is-string-group-side-effect-only-group.ts */
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
