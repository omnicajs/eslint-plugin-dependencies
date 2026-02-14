/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import type { CommonOptions } from '../../types/common-options'

import { UnreachableCaseError } from '../unreachable-case-error'

/**
 * Creates a function that formats strings for comparison.
 *
 * Applies transformations based on the provided options:
 *
 * - Case normalization (lowercase if ignoreCase is true)
 * - Special character handling (keep, trim, or remove)
 * - Whitespace removal (always applied).
 *
 * @param params - Parameters for string formatting.
 * @param params.ignoreCase - Whether to convert strings to lowercase.
 * @param params.specialCharacters - How to handle special characters:
 *
 *   - 'keep': Keep all characters as-is
 *   - 'trim': Remove leading special characters
 *   - 'remove': Remove all special characters.
 *
 * @returns Function that formats a string for comparison.
 * @throws {UnreachableCaseError} If an unknown special characters option is
 *   specified.
 */
export function buildStringFormatter({
  specialCharacters,
  ignoreCase,
}: Pick<CommonOptions, 'specialCharacters' | 'ignoreCase'>) {
  return (value: string): string => {
    let valueToCompare = value
    if (ignoreCase) {
      valueToCompare = valueToCompare.toLowerCase()
    }
    switch (specialCharacters) {
      case 'remove':
        valueToCompare = valueToCompare.replaceAll(
          /[^a-z\u{C0}-\u{24F}\u{1E00}-\u{1EFF}]+/giu,
          '',
        )
        break
      case 'trim':
        valueToCompare = valueToCompare.replaceAll(
          /^[^a-z\u{C0}-\u{24F}\u{1E00}-\u{1EFF}]+/giu,
          '',
        )
        break
      case 'keep':
        break
      /* v8 ignore next 2 -- @preserve Exhaustive guard. */
      default:
        throw new UnreachableCaseError(specialCharacters)
    }
    return valueToCompare.replaceAll(/\s/gu, '')
  }
}
