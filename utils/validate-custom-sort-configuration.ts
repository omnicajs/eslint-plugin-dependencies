/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import type {
  CommonGroupsOptions,
  GroupsOptions,
} from '../types/common-groups-options'
import type { CommonOptions } from '../types/common-options'

import { isGroupWithOverridesOption } from './is-group-with-overrides-option'

/**
 * Options for custom sort configuration validation.
 */
type Options = {
  groups?: CommonGroupsOptions<string, unknown, unknown>['groups']
} & Pick<CommonOptions, 'alphabet' | 'type'>

/**
 * Validates configuration when using custom sort type.
 *
 * Ensures that when a user selects 'custom' sorting type, they provide a valid
 * alphabet string. This prevents runtime errors and ensures the custom sorting
 * has a defined order to follow.
 *
 * The function is called at the beginning of every sorting rule's execution to
 * catch configuration errors early and provide clear error messages.
 *
 * @param options - Configuration options to validate.
 * @throws {Error} If type is 'custom' but alphabet is empty.
 */
export function validateCustomSortConfiguration(options: Options): void {
  if (!usesCustomSort(options)) {
    return
  }

  if (options.alphabet.length === 0) {
    throw new Error('`alphabet` option must not be empty')
  }
}

function usesCustomSortInGroups(groups: GroupsOptions | undefined): boolean {
  if (!groups) {
    return false
  }

  return groups
    .filter(isGroupWithOverridesOption)
    .some(groupWithSettings => groupWithSettings.type === 'custom')
}

function usesCustomSort(options: Options): boolean {
  if (options.type === 'custom') {
    return true
  }

  return usesCustomSortInGroups(options.groups)
}
