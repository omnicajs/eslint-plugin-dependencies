/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import type {
  GroupNewlinesBetweenOption,
  GroupsOptions,
} from '../types/common-groups-options'

/**
 * Type guard to check if a group option is a newlines-between configuration.
 *
 * Determines whether a group element contains a `newlinesBetween` property,
 * which indicates it's a special configuration object that controls spacing
 * between groups rather than being a regular group name or comment option.
 *
 * Newlines-between options are placed between group names in the configuration
 * to specify how many newlines should separate those groups in the sorted
 * output.
 *
 * @example
 *
 * ```ts
 * const groups = [
 *   'imports',
 *   { newlinesBetween: 1 }, // Add 1 newline between imports and types
 *   'types',
 *   { newlinesBetween: 2 }, // Add 2 newlines between types and components
 *   'components',
 *   { commentAbove: '// Utils' }, // Not a newlines option
 *   'utils',
 * ]
 *
 * isNewlinesBetweenOption(groups[0]) // false (string)
 * isNewlinesBetweenOption(groups[1]) // true (has newlinesBetween)
 * isNewlinesBetweenOption(groups[3]) // true (has newlinesBetween)
 * isNewlinesBetweenOption(groups[5]) // false (comment option)
 * ```
 *
 * @param groupOption - A single element from the groups configuration array.
 * @returns True if the element is a newlines-between configuration object.
 */
export function isNewlinesBetweenOption(
  groupOption: GroupsOptions[number],
): groupOption is GroupNewlinesBetweenOption {
  return typeof groupOption === 'object' && 'newlinesBetween' in groupOption
}
