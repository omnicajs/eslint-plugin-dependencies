/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { ESLintUtils } from '@typescript-eslint/utils'

/**
 * Documentation metadata for ESLint rules.
 *
 * Provides additional information about the rule that can be used by ESLint
 * configurations and documentation generators.
 */
export interface ESLintPluginDocumentation {
  /**
   * Indicates whether the rule is part of the recommended configuration. Rules
   * marked as recommended are typically enabled by default in the plugin's
   * recommended preset.
   *
   * @default false
   */
  recommended?: boolean
}

/**
 * Factory function for creating ESLint rules with consistent structure and
 * documentation.
 *
 * Wraps the ESLintUtils.RuleCreator to automatically generate documentation
 * URLs for each rule based on its name. All rules created with this function
 * will have their documentation hosted at dependencies.omnicajs.dev.
 *
 * @see {@link https://typescript-eslint.io/packages/utils/} - TypeScript ESLint
 * Utils documentation
 * @see {@link https://dependencies.omnicajs.dev/} - Dependencies plugin documentation
 */
export let createEslintRule =
  ESLintUtils.RuleCreator<ESLintPluginDocumentation>(
    ruleName => `https://dependencies.omnicajs.dev/rules/${ruleName}`,
  )
