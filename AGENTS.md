# AGENTS.md

## Goals

- Prioritize correctness of rule behavior over style, then test coverage, then
  code style consistency.
- Avoid clarification loops by proposing a concrete interpretation when details
  are missing.

## Testing

- If the user asks to run tests, run `pnpm test:unit`.
- For lint checks, use `pnpm test:js`.
- To fix autofixable ESLint issues quickly, use `pnpm test:js --fix` unless told
  otherwise.
- To fix autofixable Prettier issues quickly, use `pnpm test:prettier --write`
  unless told otherwise.
- For TypeScript type checks, use `pnpm test:types`.
- On failure, stop and report the failing test and likely cause; do not
  auto-retry in a loop.
- Keep coverage at 100% (global thresholds are strict).

## Loop prevention

- Maintain a short run log in `/tmp/perfectionist-run-log.txt` with the last
  command and outcome.
- Before re-running a failed command, check the log and explain what changed to
  justify a retry.

## Rule behavior

- Preserve relative order within each block unless explicitly asked to sort.
- When reordering, keep comments adjacent to their import when possible.
- Do not introduce redundant blank lines.

## Test style

- Prefer `dedent` for multiline code blocks.
- Use one scenario per `it` and keep names specific.
- Place new tests below existing ones unless instructed otherwise.
- Include both valid and invalid cases for new behaviors.

## Output expectations

- Provide one “golden output” example per new behavior (valid/invalid/mixed)
  when relevant.
- Summaries should be concise and list files changed.
