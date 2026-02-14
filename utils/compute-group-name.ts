/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import type { GroupsOptions } from '../types/common-groups-options'

import { isGroupWithOverridesOption } from './is-group-with-overrides-option'
import { isNewlinesBetweenOption } from './is-newlines-between-option'
import { UnreachableCaseError } from './unreachable-case-error'

/**
 * Computes the name of a group based on the provided group object.
 *
 * @param group - The group object.
 * @returns A string if:
 *
 *   - The group is a string.
 *   - The group is a commentAbove option with a string group.
 */
export function computeGroupName(group: GroupsOptions[number]): string | null {
  if (typeof group === 'string' || Array.isArray(group)) {
    return computeStringGroupName(group)
  }
  if (isGroupWithOverridesOption(group)) {
    return computeStringGroupName(group.group)
  }
  /* v8 ignore else -- @preserve Exhaustive guard for unsupported group option. */
  if (isNewlinesBetweenOption(group)) {
    return null
  }
  /* v8 ignore next -- @preserve Exhaustive guard for unsupported group option. */
  throw new UnreachableCaseError(group)
}

function computeStringGroupName(group: string[] | string): string | null {
  if (typeof group === 'string') {
    return group
  }
  return null
}
