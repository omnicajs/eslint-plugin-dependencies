/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import type ts from 'typescript'

import { createRequire } from 'node:module'

/**
 * Cached reference to the TypeScript module.
 */
let cachedImport: typeof ts | undefined

/**
 * Indicates whether an attempt to load the TypeScript module has already been
 * made.
 */
let hasTriedLoadingTypescript: boolean = false

/**
 * Dynamically loads the typescript module if it's available and caches it.
 *
 * @returns The TypeScript module or null if it's not available.
 */
export function getTypescriptImport(): typeof ts | null {
  if (cachedImport) {
    return cachedImport
  }
  if (hasTriedLoadingTypescript) {
    return null
  }
  hasTriedLoadingTypescript = true
  try {
    cachedImport = createRequire(import.meta.url)('typescript') as typeof ts
    // eslint-disable-next-line sonarjs/no-ignored-exceptions
  } catch (_error) {
    return null
  }
  return cachedImport
}
