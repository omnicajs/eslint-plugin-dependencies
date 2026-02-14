/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import type { TSESLint } from '@typescript-eslint/utils'

import type { CommonPartitionOptions } from '../types/common-partition-options'
import type { CommonGroupsOptions } from '../types/common-groups-options'
import type { CommonOptions } from '../types/common-options'

/**
 * Global settings for the Dependencies plugin.
 *
 * These settings can be configured in ESLint configuration under the
 * 'dependencies' key and apply to all Dependencies rules unless overridden by
 * rule-specific options.
 */
export type Settings = Partial<
  Pick<
    CommonGroupsOptions<string, unknown, unknown>,
    'newlinesBetween' | 'newlinesInside'
  > &
    CommonPartitionOptions &
    CommonOptions
>

/**
 * Extracts and validates Dependencies settings from ESLint configuration.
 *
 * Retrieves global Dependencies settings that apply to all rules. Validates
 * that only allowed settings are provided and throws an error if invalid
 * options are detected. This ensures configuration errors are caught early with
 * clear error messages.
 *
 * The settings are accessed from the 'dependencies' key in ESLint's shared
 * configuration settings.
 *
 * @example
 *
 * ```ts
 * // Valid usage:
 * const settings = getSettings(context.settings)
 * // Returns: { type: 'natural', order: 'asc', ignoreCase: true }
 * ```
 *
 * @example
 *
 * ```ts
 * // Invalid setting throws error:
 * getSettings({
 *   dependencies: {
 *     type: 'natural',
 *     invalidOption: true, // This will throw
 *   },
 * })
 * // Throws: Error: Invalid Dependencies setting(s): invalidOption
 * ```
 *
 * @param settings - ESLint shared configuration settings object.
 * @returns Validated Dependencies settings or empty object if none configured.
 * @throws {Error} If invalid settings are provided.
 */
export function getSettings(
  settings: TSESLint.SharedConfigurationSettings = {},
): Settings {
  if (!settings['dependencies']) {
    return {}
  }

  /**
   * Identifies settings keys that are not in the allowed list.
   *
   * @param object - Settings object to validate.
   * @returns Array of invalid setting names.
   */
  function getInvalidOptions(object: Record<string, unknown>): string[] {
    let allowedOptions = new Set<keyof Settings>([
      'partitionByComment',
      'partitionByNewLine',
      'specialCharacters',
      'newlinesBetween',
      'newlinesInside',
      'fallbackSort',
      'ignoreCase',
      'alphabet',
      'locales',
      'order',
      'type',
    ])

    return Object.keys(object).filter(
      key => !allowedOptions.has(key as keyof Settings),
    )
  }

  let dependenciesSettings = settings['dependencies'] as Record<string, unknown>

  let invalidOptions = getInvalidOptions(dependenciesSettings)
  if (invalidOptions.length > 0) {
    throw new Error(
      `Invalid Dependencies setting(s): ${invalidOptions.join(', ')}`,
    )
  }

  return settings['dependencies'] as Settings
}
