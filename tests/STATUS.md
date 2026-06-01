# Test status snapshot

A checked-in baseline of the suite results so runs can be compared. Update the
numbers whenever they move (after a fix or a regression) and commit the change
alongside the code — the git diff of this file is the record of what shifted.

See [`CONTEXT.md`](./CONTEXT.md) for how to run, compare, and fix.

**Last updated:** 2026-06-01

## Totals

| Suite                                | Result          |
| ------------------------------------ | --------------- |
| Examples (`tests/renderer.test.tsx`) | **79 / 79** ✅  |
| Corpus (`tests/corpus.*.test.tsx`)   | **1894 / 2001** |
| Corpus failures                      | **107**         |

## Failure categories (`triage.ts --group --summary`)

| Count | Category                                          |
| ----- | ------------------------------------------------- |
| 91    | other (manpage doctype, compat-mode toggling, nested AsciiDoc table cells, `{set:cellbgcolor}`, video/iframe macros, `imagesdir` resolution, …) |
| 4     | footnote numbering / text mismatch                |
| 2     | monospace/em nesting cross-boundaries             |
| 2     | backslash escape: hash (`\#` in monospace)        |
| 2     | mark element handling                             |
| 2     | source highlighter / code listing                 |
| 1     | unresolved xref (`<<id>>` fallback)               |
| 1     | nesting: code crossed with em                     |
| 1     | sentinel leak (`\x01`/`\x02` placeholders)        |
| 1     | passthrough macro not processed                   |

Most remaining failures are architectural (placeholder-vs-gsub inline model,
source-order attribute/counter resolution) or large feature areas (manpage
doctype, nested AsciiDoc table cells).
