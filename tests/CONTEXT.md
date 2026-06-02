# Corpus parity: how to run, compare, and fix

This project renders AsciiDoc to React, aiming for output parity with stock asciidoctor's
HTML5 converter. Two suites guard that goal; this doc is the durable workflow for driving
parity up without regressing. Current numbers live in [`STATUS.md`](./STATUS.md).

## The two suites

1. **Examples** (`tests/renderer.test.tsx`) — hand-crafted fixtures in `src/examples/`. This
   is the regression net: small, fast, must stay green.
2. **Corpus** (`tests/corpus.*.test.tsx`) — every Oxide RFD plus the asciidoctor writer's
   guide and the extracted asciidoctor test cases. Split across eight shard files so
   vitest's worker pool runs them in parallel (`corpus-shard.tsx` defines the round-robin
   slices).

## Running things

```bash
npm test                                        # examples (quick — run constantly)
npx vitest run tests/corpus.*.test.tsx          # full corpus, sharded (~7s)
npx vitest run -t "rfds/0042"                   # a single doc by name
npx vitest run -t "asciidoctor-extracted/tables_test"  # a single subdir
npx vite-node tests/triage.ts 2>/dev/null       # triage: pass/fail counts + first diff per failing doc
npx vite-node tests/triage.ts -- --group                # group failures by inferred category
npx vite-node tests/triage.ts -- --group --summary      # category counts only
npx vite-node tests/triage.ts -- --filter "tables_test" # restrict to a subset
npx tsc --noEmit                                # type check
```

## How the comparison works

For each document the harness (`tests/helpers.tsx`):

1. Runs `asciidoctor.convert(source, { standalone: false })` → the **stock** embedded HTML.
2. Loads the same source, runs our `prepareDocument` → a serialisable `DocumentBlock` tree
   (each leaf carries an `InlineNode[]` AST from the vendored parser), and renders it
   through `<Asciidoc>` with a `BodyOnly` custom document.
3. `normalise()`s both sides and asserts equality.

`normalise` collapses **insignificant** differences only — React serialisation quirks
(`<hr/>` vs `<hr>`, `colSpan` vs `colspan`, boolean attrs, auto-injected
`<link rel="preload">`, attribute order) and entity-encoding form (it decodes numeric/named
entities on both sides, since React emits literal chars where stock emits entities). It
deliberately does **not** paper over real structural or textual differences. Both pipelines
see the same attributes (`sectlinks`, `icons=font`, `stem=latexmath`, `stylesheet=false`).

## Comparing between runs

`STATUS.md` holds the committed totals + category counts. After a change:

```bash
npx vite-node tests/triage.ts 2>/dev/null | grep -E '^(pass|fail):'
npx vite-node tests/triage.ts -- --group --summary 2>/dev/null
```

To check that a change didn't regress anything (net-zero totals can still hide an offsetting
swap), diff the failing set against the working tree without your change:

```bash
npx vite-node tests/triage.ts 2>/dev/null \
  | grep -oE '(rfds|asciidoctor-extracted|writers-guide)/[^ ]+\.adoc' | sort > /tmp/after.txt
git stash push <files-you-changed> && \
  npx vite-node tests/triage.ts 2>/dev/null \
  | grep -oE '(rfds|asciidoctor-extracted|writers-guide)/[^ ]+\.adoc' | sort > /tmp/before.txt && \
  git stash pop
comm -13 /tmp/before.txt /tmp/after.txt   # newly FAILING (regressions)
comm -23 /tmp/before.txt /tmp/after.txt   # newly PASSING (fixed)
```

Then update `STATUS.md`'s numbers if they moved.

## Fixing workflow

1. Triage and **group** failures by the diff shape around the divergence — if N docs show
   the same `E:`/`R:` mismatch, that's one bug, not N.
2. **Always confirm the rule with stock asciidoctor before touching the parser:**
   ```bash
   node -e "console.log(require('@asciidoctor/core')().convert('the snippet', { standalone: false }))"
   ```
   The installed package also carries the source regexes — grep
   `node_modules/@asciidoctor/core/dist/graalvm/asciidoctor.js` for things like
   `CalloutSourceRx` when you need exact behaviour.
3. Reproduce as the smallest input — a 5-line `vite-node` probe importing `parseInline` /
   `renderInlineAsString`, or a new fixture in `src/examples/`.
4. Patch the smallest area. Pecking order, cheapest first:
   - **Block templates** (`src/asciidoc/templates/*.tsx`).
   - **`prepareDocument`** (`src/asciidoc/utils/prepareDocument.ts`) for document-context
     fixes (xref resolution, `refLabels`, source-order attribute/counter pre-scan).
   - **`inline/parser.ts`** for pipeline bugs.
5. Re-run triage + `npm test`; confirm the count dropped and nothing regressed (use the diff
   recipe above). Add a fixture for each bug class you fix.

## Don'ts

1. **Don't regress the examples suite.** It's the net; `npm test` is fast.
2. **Don't reorder the substitution pipeline**
   (`specialchars → quotes → attributes → replacements → macros → post_replacements`)
   without confirming against stock — the order mirrors Ruby's `apply_subs` and the
   placeholder sentinels (`\x01…\x02` for quotes, `…` for passthrough slots) carry meaning
   across passes. (Reorders _within_ the macro table, or moving a post-parse AST step like
   attribute resolution relative to passthrough restore, are the safer kind — still verify.)
3. **Don't `normalise()` away a real difference.** New normalisations need the same
   justification as the existing ones: a pure React-vs-asciidoctor serialisation quirk with
   no semantic difference.
4. **Don't lower an assertion** to a budget (`expect(failures).toBeLessThan(N)`). The
   failing count must stay meaningful so regressions surface.
5. **Don't widen the `prepareDocument` `getBlocks()` walk** to include list-container
   children — `getItems()` already returns them, and walking both double-parses each item
   (bumping the document-wide footnote counter).
6. **Don't share parse state between titles and content** — title inlines use a throwaway
   footnote state (asciidoctor doesn't number title footnotes) while sharing the
   document-wide counter map.

## Helpful invariants

- `prepareDocument` builds `refLabels` (id → display text) from section titles then explicit
  `document.getRefs()` reftexts; `resolveXrefs` rewrites the parser's `[id]` bracket
  fallback into the real label and handles natural (`<<Section Title>>`) and per-xref
  `xrefstyle` references.
- Body-defined attributes (`:name: value` after the header) are applied by asciidoctor only
  at convert time, so they never reach `getAttributes()`; a source pre-scan in
  `prepareDocument` merges body-only attrs into the inline attribute map. Source-order
  counter resets (`:!name:`) are tracked the same way (count-aligned, since blocks carry no
  line number without `sourcemap`).

## Conventions

- Prettier: 92 col width, no semicolons, single quotes, trailing commas.
- ESLint ignores `.js` (the examples are intentionally JS); enforces `eqeqeq`,
  `no-param-reassign`, `no-return-assign`, unused-vars.
- Releases use `auto shipit` — don't edit `CHANGELOG.md` or bump the `package.json` version
  by hand.
