/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import { describe, expect, it } from 'vitest'

import type { Settings } from '../../utils/get-settings'

import { getSettings } from '../../utils/get-settings'

describe('get-settings', () => {
  it('throws an error when an invalid setting is provided', () => {
    expect(() => {
      getSettings({
        dependencies: {
          invalidOption1: 'value',
          invalidOption2: 'value',
        },
      })
    }).toThrowError(
      'Invalid Dependencies setting(s): invalidOption1, invalidOption2',
    )
  })

  it('accepts official settings provided', () => {
    let allowedOptions: { [key in keyof Required<Settings>]: Settings[key] } = {
      fallbackSort: { type: 'alphabetical' },
      partitionByComment: 'value',
      specialCharacters: 'keep',
      partitionByNewLine: true,
      type: 'alphabetical',
      newlinesBetween: 1,
      newlinesInside: 1,
      ignoreCase: true,
      locales: 'en-US',
      alphabet: '',
      order: 'asc',
    }
    expect(() => {
      getSettings({
        dependencies: allowedOptions,
      })
    }).not.toThrowError()
  })
})
