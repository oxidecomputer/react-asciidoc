# Status update (latest pass)

Corpus parity driven from **60 → 17** failing docs (677/694 passing); examples
suite **76/76** (8 new regression fixtures added); `tsc` clean; `npm run build`
green.

Fixed this pass:
- **Natural xrefs** now match a section's title text EXACTLY (no slugification)
  and only when the target has a space/uppercase — mirroring asciidoctor's
  `resolve_id`. A registered id (even a bare `[[ID]]` anchor) wins as a direct
  hit. Targets that match nothing (e.g. one spanning a line break) stay broken,
  like stock. (`prepareDocument.ts`)
- **xref display text** is the plain section title by default; `:xrefstyle:
  short|full` renders `Section N` / `Section N, "Title"`. Captioned blocks
  (tables/images) resolve via `xreftext` too (e.g. "Table 7"). (`prepareDocument.ts`)
- **TOC** drops inline anchors/links from entry text (`DropAnchorRx`). (`Outline.tsx`)
- **`<<id,reftext, with, commas>>`** keeps the whole reftext (was truncated by
  `split(',', 2)`). (`parser.ts`)
- **Placeholder cycle** in `` `[.black]#*x*#` `` (mono + roled mark + bold) no
  longer infinite-loops — DFS guard in the placeholder rebuild. (`parser.ts`)
- **Email** at the start of a quoted span isn't linkified; **`link::`** (double
  colon) stays literal; **`:hide-uri-scheme:`** strips the scheme from bare URL
  text. (`parser.ts`)
- **`{counter:name}` / `{counter2:name}`** document-wide counters (no-reset
  cases). De-duped section-title and table-cell parses (also fixed footnote
  double-counting). (`parser.ts`, `prepareDocument.ts`)
- **`:hardbreaks-option:`** (not just `:hardbreaks:`) enables doc-wide hard
  breaks. **Em-dash** fires between digits (`2190--2020`). **Bibref** ids can't
  start with a digit (`[[[22-update]]]` stays literal). (`parser.ts`)
- **Image alt** entities preserved (`&#8217;` via raw HTML string). **Doc-title
  `id`** emitted on the `<h1>`; title h1 only when the doc has a header.
  (`Image.tsx`, `Document.tsx`, `prepareDocument.ts`, `helpers.tsx`)

Remaining 17, all architectural or source-order-dependent (documented limits):
- **Placeholder-vs-gsub** interactions: backslash-in-mono when a later `#…#`
  mark pair forms (0137, 0353, 0479), mono-inside-emphasis (0609), a `` `*` ``
  mono edge (0148). Need the HTML-inlining model, not opaque placeholders.
- **Source-order attribute entries** (unrecoverable post-load): counter resets
  via `:!steps:` (0524, 0528, 0539, 0582, 0585, 0598) and body-defined
  attributes that asciidoctor resolves inline but doesn't retain (0007).
- **Niche**: bibref rendering inside `[bibliography]` lists / malformed `=`
  lines (0263, 0561), footnote whose content holds a URL with escaped brackets
  (0234), URL with encoded `&lt;…&gt;` boundary (0268), inter-document xref with
  a `relfileprefix` URL base (0520).

---

# Handoff: Drive corpus parity to zero divergences

You're picking up a React renderer for AsciiDoc that converts each block to
JSX and feeds inline source through a vendored TypeScript port of
asciidoctor's inline substitution pipeline. There are two test suites:

1. **`tests/renderer.test.tsx`** — 68 hand-crafted examples in
   `src/examples/`. All green.
2. **`tests/corpus.test.tsx`** — every Oxide RFD in asciidoc format (694
   docs, ~16 MB) plus the asciidoctor writer's guide. **The starting
   baseline is 80 cherry-picked RFDs at 73/80 passing**; the full 694 was
   just pulled and has NOT been triaged yet.

Your job is to drive corpus parity to zero divergences (or as close as a
TypeScript port can reasonably get), the same way the
`asciidoctor-inline` repo was driven from 1025 divergences to 4.

## Quick orientation

```
src/asciidoc/
  index.tsx              # library entry — exports Asciidoc, Content,
                         # RenderInline, prepareDocument, etc.
  RenderInline.tsx       # inline AST → JSX; `inlineHtml(nodes)` is the
                         # byte-parity path templates use by default
  inline/                # vendored asciidoctor-inline parser
    index.ts             # parseInline, renderInlineAsString, types
    parser.ts            # ~1300 lines — the pipeline
    quotes.ts, rx.ts     # regex tables
    renderer.ts          # InlineNode tree → HTML5 string
  templates/             # one React component per block type
  utils/
    prepareDocument.ts   # Asciidoctor AST → serialisable DocumentBlock;
                         # populates `inlines`/`textInlines` via parseInline;
                         # resolves xref reftexts/section titles

tests/
  helpers.tsx            # shared stockHtml/reactHtml/normalise + BodyOnly
  renderer.test.tsx      # examples test
  corpus.test.tsx        # corpus test
  triage.ts              # diagnostic — runs the corpus once and prints
                         # the first divergence per failing doc
  fetch-corpus.sh        # refresh tests/corpus/rfds/ from rfd-cli
  corpus/
    rfds/                # 694 .adoc files, NNNN.adoc
    writers-guide/       # asciidoctor's writer guide

CLAUDE.md                # repo-level architecture notes; read this first
```

## Running things

```bash
# Unit tests (examples) — quick, run constantly.
npm test
# Just the corpus.
npx vitest run tests/corpus.test.tsx
# One RFD.
npx vitest run -t "rfds/0042"

# The triage runner — best for understanding failures across the whole
# corpus at once. Prints pass/fail count and the first ~80 chars at the
# point each failing doc diverges. Use vite-node (not bare tsx) so the
# JSX transform matches what vitest does.
npx vite-node tests/triage.ts 2>/dev/null

# Refresh the corpus from rfd-cli (~30s).
./tests/fetch-corpus.sh
```

`rfd-cli` lives at `~/Development/rfd-cli`. It needs internet + an
authenticated config; it's already configured on Benji's machine. The
fetch script uses `rfd list -f json` + `rfd view --number N`, filters to
`format=asciidoc`, writes `NNNN.adoc` (zero-padded).

**Important:** `rfd-cli` requires authentication that may have expired. If
fetch fails, ask Benji to refresh — don't try to work around it.

## How the parity machine works

For each document the harness:

1. Runs `asciidoctor.convert(source, { standalone: false })` → the
   "stock" embedded HTML.
2. Loads the same source as a doc, calls our `prepareDocument` to
   produce a JSON-ish `DocumentBlock` tree where each leaf with content
   model `simple` carries both the old `content` HTML string AND a
   freshly-parsed `inlines: InlineNode[]` AST.
3. Renders `<Asciidoc>` with a `BodyOnly` custom document (so we get
   only the embedded-mode chrome: optional `<h1>` title when
   `:showtitle:`, top-of-body TOC, `<Content>`, footnotes block).
4. Normalises whitespace and a handful of React-vs-asciidoctor
   serialisation quirks (`<hr/>` vs `<hr>`, `colSpan` vs `colspan`,
   React 19's auto-injected `<link rel="preload">`, etc.).
5. `expect(reactHtml).toBe(stockHtml)`.

Both pipelines see the same `attributes` set in `helpers.tsx`:
`sectlinks=true, icons=font, stem=latexmath, stylesheet=false`. RFDs
typically also set `:toc: left`, `:showtitle:`, `:numbered:` etc. in
their headers.

## State at handoff

- Examples suite: **68/68 passing** — don't regress this.
- 80-RFD subset (the original `asciidoctor-inline` corpus): **73/80
  passing** before the full pull.
- Full corpus (694 RFDs + writer's guide): not yet measured — run
  `npx vite-node tests/triage.ts` to get the baseline first.

The 7 known failures from the 80-RFD baseline (all the categories
below) almost certainly account for many more failures in the full 694.
Tackle them in order of frequency.

## Known failure categories

Run the triage script and group failures by which category they hit
before picking. The categories below are ranked by how prevalent they
were in the 80-RFD sample — re-rank against your fresh triage output.

### 1. xrefstyle "short"/"full" (high impact — was rfd0088)

Stock with `:xrefstyle: short` formats section refs as
`<a href="#s-x">Section N, "Title"</a>` or
`<a href="#s-x">Section N</a>`. We just emit the plain title. Needs:

1. Track per-doc `xrefstyle` attribute in `prepareDocument`.
2. Track section numerals in the section-titles map (we already collect
   `getCaptionedTitle()`; that has the prefix, but `xrefstyle: short`
   wants `Section N, "Title"` form, not just the captioned title).
3. Apply the format in `resolveXrefs`.

The Ruby reference is `convert_inline_anchor` in
`lib/asciidoctor/converter/html5.rb` (search for `xrefstyle`).

### 2. Section appendix prefix (was rfd0538)

Stock renders Appendix sections as `Appendix A: Title` in xrefs and the
TOC. We're double-prefixing as `A. Appendix A: Title` because
`getCaptionedTitle()` already includes "Appendix A:" but we're also
adding the `num` ("A.") in TOC/section rendering.

Fix in `templates/Section.tsx` and `templates/Outline.tsx` — when the
section's caption already contains the numeral, don't add it again. Or
detect appendix style and skip the manual prefix.

### 3. URL fragment em-dash conversion (was rfd0125)

Stock applies the `--` → `&#8212;&#8203;` replacement even inside URL
hrefs (e.g. `#2190--2020-06-09` → `#2190&#8212;&#8203;2020-06-09`). Our
parser stores the URL verbatim in `node.target` and never applies
replacements to it.

Fix in `src/asciidoc/inline/parser.ts` — apply `subReplacements` to the
URL target in the link macro handlers. Probably guarded behind a check
that the target is internal (`#...`) rather than full URL, since stock
applies it to both but it changes meaning more for internal anchors.

### 4. Backslash-escape in monospaced (was rfd0479)

Stock: `` `\#[endpoint]` `` → `<code>#[endpoint]</code>` (strips
backslash).  
Ours: `<code>\\#[endpoint]</code>` (keeps the literal backslash).

The HANDOFF in asciidoctor-inline already flagged this as an
architectural limitation — fixing it properly requires the
HTML-inlining model that asciidoctor uses (matching across rendered
output, not opaque placeholders). For a quick win, you might be able to
strip leading-backslash escapes from mono-passthrough text in
`subQuotes`/`restorePassthroughs`.

### 5. Bibref-in-list with no space (was rfd0493 — already fixed)

`[[[id]]]https://…` — the URL macro used to eat the third `]`. **Fixed
by moving the bibref regex above the URL macro in `macroRegexes`**, but
double-check this still holds in your triage.

### 6. Mono inside emphasis (was rfd0609)

`_only until one of them returns `Ready`_` —  
Stock: `<em>only until one of them returns &#x60;Ready&#x60;</em>`
(backticks kept literal).  
Ours: `<em>only until one of them returns <code>Ready</code></em>`.

Stock seems to not apply the constrained-mono substitution inside the
emphasis because of how its gsub-style pipeline sees the
already-rendered `<em>` boundary. Our placeholder model recursively
processes inner text, so mono fires.

Likely fix: when processing `emphasis` inner text in `subQuotes`,
disable constrained-mono. Or: keep mono pass running but switch the
placeholder-substitution to consume `` ` `` only when it would form a
valid constrained span across the EMITTED HTML, not the AST. The
former is much simpler.

### 7. Existing-id case mismatch (rfd0161 — already fixed)

`<<_Foo>>` where the actual id is `_foo`: stock keeps the broken case
in the href; we used to slug-normalize it. **Fixed by gating
slug-rewrite on "target doesn't start with idprefix"**. Don't undo this.

## Workflow

1. `npx vite-node tests/triage.ts 2>/dev/null | head -200` — establish
   baseline.
2. Pick the highest-volume failure category. Group failures by the diff
   substring around the divergence point — if 30 RFDs all show
   `<a href="#rfdX">[RFD X]</a>` mismatch in one shape, that's one bug.
3. **Always confirm with stock asciidoctor before changing the parser**:
   ```bash
   node -e "
     const A = require('@asciidoctor/core')();
     console.log(A.convert('the suspicious snippet', { standalone: false }));
   "
   ```
   If the rule is non-obvious, also check the Ruby source — see the
   `asciidoctor-inline/HANDOFF.md` "Referencing the original
   asciidoctor implementation" section for `gh api` recipes and the
   TS-to-Ruby function mapping.
4. Reproduce the failure as the smallest possible example in
   `src/examples/` or as a 5-line snippet in a probe script (see
   `/tmp/probe2.tsx` style — uses vite-node so the JSX transform
   matches vitest).
5. Patch the smallest area that fixes the rule. The pecking order:
   - **Block templates** (`src/asciidoc/templates/*.tsx`) are
     cheapest to change.
   - **`prepareDocument`** is next — for document-context fixes like
     xref resolution (`refLabels` map, `resolveXrefs` function).
   - **`inline/parser.ts`** for pipeline bugs. **Don't reorder the
     substitution pipeline without confirming nothing regresses.**
     Especially: don't move the macro pass relative to specialchars,
     quotes, attributes, replacements. The bibref-above-URL move
     mentioned above is the safest kind of reorder (within the
     macroRegexes table).
6. Re-run `npx vite-node tests/triage.ts` — confirm count dropped AND
   no other docs regressed.
7. `npm test` — examples suite must stay green.
8. Repeat.

## Don'ts

1. **Don't regress the examples suite.** It's the regression net.
   `npm test` is fast (<2s); run it after every parser change.
2. **Don't reorder substitution passes** in `subQuotes` /
   `subAttributes` / `subReplacements` / `subMacros` /
   `subPostReplacements` without confirming with stock first. The order
   matches Ruby's `apply_subs` and a wrong order produces subtle
   misparses far from the change site.
3. **Don't decode entities** in templates. Always render inline content
   via `dangerouslySetInnerHTML={inlineHtml(node.inlines)}` (or a
   pre-built HTML string), never via `parse()` / JSX children — those
   decode `&#8217;` to literal `'` and break byte-parity.
4. **Don't normalise away real failures** in the test harness. If the
   diff is on something real (xref text, footnote numbering,
   block structure), fix the renderer — don't add a regex to
   `normalise()` that papers over it. The void-elements /
   `<link rel="preload">` / boolean-attribute normalisations are
   pre-existing acceptable workarounds because they're React
   serialisation quirks with no real difference; new normalisations
   need the same justification.
5. **Don't widen the `prepareDocument` getBlocks()` walk to include
   list-container children**. We intentionally skip `getBlocks()` for
   `olist`/`ulist`/`colist`/`dlist` because it returns the SAME items
   that `getItems()` returns — walking both parses each item twice and
   bumps the document-wide footnote counter on every duplicate visit.
6. **Don't share parse state between titles and content**. Title
   inlines use a throwaway `ParseState` so footnotes in titles don't
   advance the document-wide counter (matches asciidoctor, which doesn't
   number title footnotes).
7. **Don't try to make tests pass by lowering the assertion** to a
   budget like `expect(failures).toBeLessThan(N)`. The point of the
   harness is that you can see when something regresses. As you fix
   things, the failing-test count drops naturally.

## Helpful invariants

- `prepareDocument` builds `refLabels: Map<string, string>` (id → display
  text) from two sources: section titles (recursive `getSections()`)
  then explicit reftexts from `document.getRefs()`. The latter
  overrides. Add new ref sources here if you find xref text that
  asciidoctor pulls from somewhere else (e.g. floating titles, footnote
  ids, dlist term ids).
- `resolveXrefs` walks the InlineNode tree post-parse and rewrites
  `<a href="#id">[id]</a>` (the parser's bracket fallback) into the
  real label. It also handles natural xrefs (`<<Section Title>>`) by
  slugifying the target.
- The slug rule (`idprefix='_'` default) is `_` + lowercase +
  non-alphanum→`_`. Asciidoctor's behavior matches this for default
  options. Custom `:idprefix:` / `:idseparator:` aren't implemented.

## When you're done

- `npm test` is fully green (examples).
- `npx vitest run tests/corpus.test.tsx` passes, or you've documented
  the last few divergences as architectural limits (mono-inside-em,
  backslash-in-mono — same class of "HTML-inlining vs placeholders"
  issue that the asciidoctor-inline HANDOFF documents).
- `npx tsc --noEmit` is clean.
- `npm run build` still produces working `dist/`.
- New small fixtures in `src/examples/` for each bug class you fixed.
  Each fixture should be the SMALLEST input that triggers the bug, with
  source comments describing the rule it tests.

## A suggested first 30 minutes

1. Read `CLAUDE.md` (the architecture overview).
2. Read `src/asciidoc/utils/prepareDocument.ts` (the `resolveXrefs` and
   `refLabels` machinery — the central nervous system for xref
   parity).
3. Read `src/asciidoc/inline/parser.ts` from the top through
   `subQuotes` (~700 lines). Skim the rest.
4. `npx vite-node tests/triage.ts 2>/dev/null | head -200` — establish
   baseline.
5. Group the diff output by the rough pattern around the divergence
   (xref text shape, footnote number, block structure, etc.). Find the
   biggest group.
6. Probe stock asciidoctor on the smallest reproducer. Add a fixture
   to `src/examples/`. Patch. Re-run triage.
