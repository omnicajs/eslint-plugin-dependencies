---
name: create-commit
description:
  Create a conventional commit message following commitlint.config.ts and
  project-specific instructions, including a detailed body.
metadata:
  short-description: Create conventional commit messages for this repo
---

# Create Commit Message

Use this skill when asked to craft a commit message for this repository.

## Workflow

1. Read `commitlint.config.ts` to confirm the allowed conventional commit
   format.
2. Determine the correct `type` and optional `scope` based on the changes.
3. Write a concise subject line (imperative, lowercase) that follows
   conventional commits.
4. Add a detailed body describing the key changes and why they were made.
5. Save the message to `commit.txt` in the repo root unless the user requests a
   different file.

## Project Notes

- Follow conventional commits: `type(scope): subject` or `type: subject`.
- Prefer `feat` or `fix` for user-facing changes; use other types only when
  appropriate.
- Keep the subject brief and specific; do not end with a period.
- The body should be wrapped at ~72 characters and include concrete details.
