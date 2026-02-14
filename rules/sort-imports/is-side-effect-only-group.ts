/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import type { GroupsOptions } from '../../types/common-groups-options'

import { isStringGroupSideEffectOnlyGroup } from './is-string-group-side-effect-only-group'
import { computeGroupsNames } from '../../utils/compute-groups-names'

/**
 * Checks if a group is a side-effect-only group.
 *
 * A side-effect-only group is one that contains no imports or exports, and is
 * typically used for modules that only execute code without exporting any
 * values.
 *
 * @param group - The group to check.
 * @returns True if the group is a side-effect-only group, false otherwise.
 */
export function isSideEffectOnlyGroup(
  group: GroupsOptions[0] | undefined,
): boolean {
  if (!group) {
    return false
  }

  let groupNames = computeGroupsNames([group])
  if (groupNames.length === 0) {
    return false
  }

  return groupNames.every(isStringGroupSideEffectOnlyGroup)
}
