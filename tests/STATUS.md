# Test status snapshot

A checked-in baseline of the suite results so runs can be compared. Update the numbers
whenever they move (after a fix or a regression) and commit the change alongside the code —
the git diff of this file is the record of what shifted.

See [`CONTEXT.md`](./CONTEXT.md) for how to run, compare, and fix.

**Last updated:** 2026-06-01

## Totals

| Suite                                | Result          |
| ------------------------------------ | --------------- |
| Examples (`tests/renderer.test.tsx`) | **79 / 79** ✅  |
| Corpus (`tests/corpus.*.test.tsx`)   | **1894 / 2001** |
| Corpus failures                      | **107**         |

## Failure categories (`triage.ts --group --summary`)

| Count | Category                                                                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 91    | other (manpage doctype, compat-mode toggling, nested AsciiDoc table cells, `{set:cellbgcolor}`, video/iframe macros, `imagesdir` resolution, …) |
| 4     | footnote numbering / text mismatch                                                                                                              |
| 2     | monospace/em nesting cross-boundaries                                                                                                           |
| 2     | backslash escape: hash (`\#` in monospace)                                                                                                      |
| 2     | mark element handling                                                                                                                           |
| 2     | source highlighter / code listing                                                                                                               |
| 1     | unresolved xref (`<<id>>` fallback)                                                                                                             |
| 1     | nesting: code crossed with em                                                                                                                   |
| 1     | sentinel leak (`\x01`/`\x02` placeholders)                                                                                                      |
| 1     | passthrough macro not processed                                                                                                                 |

Most remaining failures are architectural (placeholder-vs-gsub inline model, source-order
attribute/counter resolution) or large feature areas (manpage doctype, nested AsciiDoc table
cells).

## Serialized AST size (`measure-size.ts`)

`prepareDocument` → `JSON.stringify` byte counts. Run `npx vite-node tests/measure-size.ts`
(measures the fetched RFD corpus if present, plus a deterministic synthetic table-heavy doc
the harness generates in-memory — the per-cell-duplication pathology, no committed fixture
needed).

**2026-06-28** — two changes, both verified by **byte-identical rendered HTML** across all
707 RFDs (render-hash diff empty) with examples at **79 / 79**, confirming nothing reads the
dropped data:

1. Dropped write-only `cell.column` / `cell.source` / `cell.lines` (no reader in the org;
   `LiteralBlock.source` kept — rfd-site feeds it to Mermaid).
2. Dropped the duplicated `rows` field (and the `Row` type) from `TableBlock` — it held the
   same cells as the flat `headRows`/`bodyRows`/`footRows` under a second key,
   double-serialized. The renderer reads the flat arrays; the two internal walkers were
   rewired to them. (docs already stripped `rows` in its own slim pass — this moves that
   upstream.)

| Measure                | main (v2.1.1) | + cell fields | + drop `rows` |
| ---------------------- | ------------- | ------------- | ------------- |
| Corpus (707 RFDs)      | 88.53 MB      | 69.46 MB      | 52.99 MB      |
| Synthetic tables       | 17.34 MB      | 10.98 MB      | 5.64 MB       |
| Synthetic ratio to src | 40.6×         | 25.7×         | 13.2×         |

Cumulative: corpus **−40%**, synthetic table-heavy doc **−67%**. (For reference, the docs
app's real `metrics/timeseries-schemas` page measured 8.75 MB → 3.09 MB, −65% — same
pathology; the synthetic doc stands in so no 185 KB blob lives in the repo. The full
2001-doc corpus count wasn't re-run: the `asciidoctor-extracted` shard has no in-repo fetch
path. Render-hash invariance is the stronger check for these changes.)
