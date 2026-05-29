# Status update (React-tree migration + parity pass)

Corpus parity at **665/694** passing; examples suite **75/76** (the lone failure,
`writersGuide`, is the architectural em-in-em nesting limit); `tsc` clean.

## Major change this pass: templates render our inline AST as React, not strings

Per the decision to "use our own parser everywhere and stop calling asciidoctor's
inline converter", block templates were migrated from
`dangerouslySetInnerHTML={inlineHtml(node.inlines)}` (byte-parity HTML strings)
to `<RenderInline nodes={…} />` (a real React element tree). Migrated: Paragraph,
Admonition, Sidebar, Section (title + anchor/link wrapping), FloatingTitle,
OList, UList, CoList, DList, Example, Open, Quote. `RenderInline.tsx` was rewritten
to a pure React walk (uses `entities.decodeHTML` + `html-react-parser` for `raw`
nodes).

**Byte-parity is intentionally forfeited.** React decodes/re-escapes entities and
reorders attributes, so the harness (`tests/helpers.tsx` `normalise`) now compares
**structure + decoded text**, not bytes: it decodes all numeric/named entities,
sorts tag attributes, and protects `&lt;`/`&gt;`/`&amp;` (including stock's
malformed semicolon-less `&gt`/`&lt`) so escaped chars stay comparison-equal.

**Table cells were deliberately NOT migrated** (still render asciidoctor's
`getText()`/`getContent()`). Routing cells through our parser exposed the
mono/em/mark nesting limit in ~3 corpus docs and a counter case that needs
source-order attribute resolution — a net parity loss — so the table template was
reverted to asciidoctor output. Verbatim blocks (Listing/Literal/Verse/Stem) and
`pass` likewise still use `getContent`.

## Fixed this pass (each verified no-regression via triage)

- **`link:`/`mailto:` macro** no longer spans whitespace (`a link: link:URL[x]`
  now keeps `link:` literal and links `URL`, not `link:URL`). (`parser.ts`)
- **Email autolink** suppressed after any lead char `\ > : /` — `mailto:a@b`
  without brackets stays plain (was `mailto::a@b`). (`parser.ts`)
- **Per-xref `xref:id[xrefstyle=short|full]`** computes the styled label from the
  target (overriding the doc `:xrefstyle:`), instead of printing `xrefstyle=full`
  as link text. (`parser.ts`, `prepareDocument.ts`, `types.ts`)
- **Body-defined attributes** (`:name: value` after the header, which asciidoctor
  only applies during *conversion* so they never reach `getAttributes()`) are
  pre-scanned from the source and merged into `inlineAttrs` (body-only keys only,
  so header/API/locked attrs are never overridden). (`prepareDocument.ts`)
- **Bibref in a `[bibliography]` item**: only the entry-defining (first) `[[[id]]]`
  is rewritten to anchor-first `<a id></a>[id]`; later inline `[[[id]]]` keep the
  normal `[<a id></a>]` form. (`UList.tsx`)
- **Harness**: stock's invalid semicolon-less `&gt`/`&lt` (emitted by its
  email/URL macros) is now treated as the escaped char, matching our well-formed
  `&gt;`/`&lt;`. (`helpers.tsx`)
- **Counter-reset infrastructure** added (correct, currently neutral): a source
  pre-scan records `:!name:` resets per counter-use-index and the parser replays
  them; the pre-scan skips `----`/`....`/`++++`/`////` fences. (`parser.ts`,
  `prepareDocument.ts`)

## Remaining 29 — architectural or niche (documented limits)

- **Mono/em/mark nesting** (~14: 0148, 0159, 0161, 0165, 0215, 0250, 0370, 0476,
  0579, 0580, 0609, 0637, 0658): our placeholder model parses each quoted span in
  isolation, so a formatting pair that straddles a span boundary (`<em>…<code>`,
  `<code>…<strong>`, mono-in-curly-quote) is dropped. Needs asciidoctor's
  single-gsub-over-rendered-HTML model.
- **Backslash-in-mono** (0081, 0137, 0353, 0479): same gsub-vs-placeholder root —
  `\#`/`\]` is only stripped when a later `#…#`/`]` pair forms across the whole
  text, which our per-span parse can't see.
- **Source-order counters in body attributes** (0524, 0528, 0539, 0582, 0585,
  0598): `:hw-teardown: Act {counter:acts}` increments `acts` mid-body, then
  `==== Act {acts}:` reads it — unrecoverable without per-block source positions
  (blocks report no line number unless the doc is loaded with `sourcemap`).
- **Niche**: footnote whose content holds a URL with escaped brackets (0234 —
  macro-order tradeoff, see the comment above `macroRegexes`); `<…>` inside a URL
  in monospace (0268, 0364, 0681); nested `<<xref>>` inside URL link text (0206 —
  `processInlineText` doesn't re-run macros); iframe passthrough attribute casing
  React normalizes (0213).

---

# TODO: finish the `getContent` / `getText` removal

Goal: stop calling asciidoctor's inline/content converter entirely — every
rendered string should come from our vendored parser (or our own verbatim
escaping). Status: paused mid-way. The two helpers to delete live in
`prepareDocument.ts` (`getContent` ~L267, `getText` ~L279). Below is the full
remaining work, the exact behaviour each replacement must match, and the
hard-won asciidoctor details.

## 1. Remaining `getContent` / `getText` call sites and how to replace each

`getContent(block)` populates the `content` field; `getText(node)` populates
list-item / table-cell / footnote `text`. Consumers and replacements:

### a. Verbatim blocks — Listing, Literal, Verse (`content` field)
Render `content` ourselves from the raw source with **specialchars THEN
callouts** (asciidoctor's verbatim sub set is `[:specialcharacters, :callouts]`).
- Source = `block.getSourceLines().join('\n')` (already captured as `source` for
  listing/literal; verse uses sourceLines too).
- `subSpecialchars(src)` already exists in `parser.ts` (L326) — export it.
- **Add `subCallouts(escapedText, iconsFont)`** — port of asciidoctor's
  `sub_callouts`. It runs on the ALREADY-specialchars-escaped text (so it matches
  `&lt;N&gt;`, not `<N>`). The regex (extracted from the installed
  `@asciidoctor/core`, `dist/graalvm/asciidoctor.js`):
  ```
  CalloutSourceRx ≈ /((?:\/\/|#|--|;;) ?)?(\\)?&lt;!?(|--)(\d+|\.)\3?&gt;(?=(?: ?\\?&lt;!?\3(?:\d+|\.)\3&gt;)*$)/   (per line, multiline)
  ```
  Behaviour (verified against stock with `icons=font`):
  - Group1 = optional line-comment delimiter (`//`/`#`/`--`/`;;`) + optional
    trailing space. **It and its trailing space are DROPPED**; the whitespace
    *before* the comment is preserved (e.g. `foo // <1>` → `foo <conum>`).
  - Group2 = escape backslash. If present, emit `&lt;N&gt;` literally (drop only
    the `\`), no conum.
  - `<.>` auto-numbers: keep an `autonum` counter, `++autonum` per `.`; an
    explicit `<N>` uses N (asciidoctor sets `autonum = N`). Counter resets per
    block.
  - Conum HTML: `icons=font` → `<i class="conum" data-value="N"></i><b>(N)</b>`;
    otherwise `<b class="conum">(N)</b>` (note the listing form uses `(N)` with
    parens; the colist table form uses bare `N` — that's already in CoList.tsx).
  - `&lt;x&gt;` (non-numeric) is NOT a callout — stays escaped.
- `iconsFont = docAttrs.icons === 'font'` (the test harness always sets it).
- Then in prepareDocument: `content = subCallouts(subSpecialchars(source), iconsFont)`.
  Templates (Listing/Literal/Verse) keep their `dangerouslySetInnerHTML` and the
  `<pre>`/`<code class="language-…">` wrapping — only the *source* of the string
  changes. **Regression net:** the `coList` and `listing` examples have callouts
  in 6+ variations; match them exactly. Whitespace inside `<pre>` is significant
  (the harness stashes `<pre>`/`<code>` verbatim).
- **Limitation to document:** with a real `:source-highlighter:` set,
  asciidoctor's `getContent` returns highlighted `<span>`s. Our escaping does
  not highlight. The harness sets no highlighter so tests are unaffected; note it
  for library consumers.

### b. Stem (`content` field)
`content = subSpecialchars(source)` (e.g. `x < y` → `x &lt; y`). The template
wraps in `\[…\]` / `\$…\$`. No callouts.

### c. Pass (`content` field)
`content = block.getSourceLines().join('\n')` raw — passthrough emits the source
unescaped (`<custom>raw & html</custom>` stays literal). Honour a `subs=` attr if
present (rare); default is no subs.

### d. Table cells (`cell.text` / `cell.content`)
This is the migration that was prototyped and **reverted** (see git history of
this session / the status note above) because it exposes the parser nesting limit.
To finish the removal, re-apply it and accept the cost:
- default / header style: parse cell source into per-paragraph inline ASTs
  (`textParagraphs: InlineNode[][]`, split on blank lines, one `parseInline` pass
  total so counters aren't double-bumped) and render each as
  `<p class="tableblock">`, wrapping in the column style (`emphasis`→`<em>`,
  `strong`→`<strong>`, `monospaced`→`<code>`; `header`/default unwrapped).
- head cells: `<th><RenderInline nodes={cell.textInlines}/></th>` (no `<p>`).
- foot cells: `<p class="tableblock"><RenderInline …/></p>`.
- `asciidoc`-style cells: the cell holds a nested AST — recurse `processBlock`
  over the cell's inner blocks and render via `<Content>` instead of
  `cell.content`. (Check the Cell API for the inner-document/getBlocks accessor.)
- `literal`-style cells: `subSpecialchars(source)` inside `<div class="literal"><pre>`.
- **Known cost:** regresses ~3–4 corpus docs to the mono/em/mark nesting limit
  (0144, 0160, 0327) plus a head-cell link case (0151), and the counter docs
  (0524…) stay failing. These are the same architectural class as `writersGuide`.

### e. Footnotes (`document.getFootnotes()`)
Collect definitions from OUR parser instead of asciidoctor:
- Add `footnoteDefs?: Array<{ index: number; id?: string; text: InlineNode[] }>`
  to `ParseState`; have the footnote handler's `define()` (parser.ts ~L1258)
  push `{ index, id, text }`.
- In prepareDocument set `preparedDocument.footnotes` from
  `inlineState.footnoteDefs` (sorted by index, dedup by index for references).
- Render via `<RenderInline>` in both `Document.tsx` (`Footnotes`) and
  `tests/helpers.tsx` (`BodyOnly`) instead of `parse(f.text)` /
  `dangerouslySetInnerHTML`.

### f. List-item `text`
`item.text` (from `getText`) is now only a truthiness guard (DList `dd.text &&`,
etc.) — replace with `item.textInlines?.length` or `block.hasText()`. The
bibliography path already uses `textInlines`.

## 2. Remaining internal asciidoctor inline parsing (beyond getContent/getText)

- **Titles** — `node.title` comes from `getTitle()` / `getCaptionedTitle()`,
  which inline-convert via asciidoctor. Replace with the already-populated
  `titleInlines` (our parser) + a caption PREFIX from `block.getCaption()` (a
  plain label like `"Table 1. "` — NOT inline-parsed, safe to keep). So a
  captioned title = `getCaption()` string + `<RenderInline nodes={titleInlines}/>`.
  Touch points: the `Title` util (`templates/util.tsx` — change it to take
  `inlines` + optional caption), `Table` caption, `Outline` (TOC still reads
  `section.title` strings — switch to `titleInlines`), `Example` collapsible
  `<summary>`, and the doc-title `<h1>` in `helpers.tsx`/`Document.tsx`. Section
  headings already use `titleInlines`.
- **Authors** — `document.applySubstitutions(name/email)` in prepareDocument.
  Minor; parse via our parser or leave (it's not getContent/getText, but it is
  asciidoctor inline subs).
- After all the above, **delete `getContent`, `getText`, and the `content` field**
  (keep `source`); grep for `.getContent`/`.getText`/`getCaptionedTitle`/`getTitle`
  to confirm none remain in `prepareDocument.ts`.

## 3. Rough plan for the remaining ~29 corpus divergences

Grouped by root cause (see the status section for the per-doc lists):

1. **Mono/em/mark nesting (~14) + backslash-in-mono (4) — the big one.** Our
   parser processes each quoted span as an isolated sub-tree, so a formatting
   pair that straddles a span boundary (`<em>…<code>`, mono-in-curly-quote,
   `\#`…`#`) is lost. The real fix is to replace the placeholder model with
   asciidoctor's **single-gsub-over-emitted-HTML** approach — i.e. run the quote
   substitutions against the rendered HTML string so a `#…#` / backtick pair is
   matched across already-emitted tags. This is the same rewrite the
   `asciidoctor-inline` repo did to get from 1025→4 divergences. Until then these
   stay failing (same class as `writersGuide`). Biggest single lever for parity.
2. **Source-order counters in body attributes (6: 0524, 0528, 0539, 0582, 0585,
   0598).** `:hw-teardown: Act {counter:acts}` increments `acts` mid-body, then
   `==== Act {acts}:` reads it. Needs per-block source POSITIONS to interleave
   attribute-entry/counter resolution with the walk. **Load the doc with
   `sourcemap: true`** so `block.getLineNumber()` is populated, then process
   `:name: value` / `:!name:` / `{counter…}` entries in true line order
   (updating `inlineState.counters` and `inlineAttrs` as you pass each block).
   The count-aligned `counterResets` pre-scan already added is the fallback for
   when line numbers are absent. (Harness: add `sourcemap: true` to the
   `ad.load` in `reactHtml`.)
3. **Niche, each ~1 doc:**
   - `0206` nested `<<xref>>` inside URL link text — `processInlineText` only
     wraps text; make it (or the link handler) re-run the macro pass on the link
     text so the inner xref parses, or reorder xref before the URL macro and rely
     on placeholder rebuild.
   - `0268`/`0364`/`0681` `<…>` inside a URL in monospace — URL boundary vs the
     `&gt` quirk; inspect the URL regex alternatives (parser.ts ~L1069).
   - `0234` footnote whose content holds a URL with escaped brackets — macro
     order tradeoff (URL-before-footnote is intentional; see comment above
     `macroRegexes`). Needs asciidoctor's exact pass order + bracket balancing.
   - `0213` iframe passthrough — React lowercases `frameBorder` and drops
     `onmousewheel`. Needs raw-HTML passthrough rendering that bypasses React
     attribute normalization (render the pass block's raw HTML as a string, not
     through `html-react-parser`).

---

# Handoff: Drive corpus parity to zero divergences

You're picking up a React renderer for AsciiDoc that converts each block to
JSX and feeds inline source through a vendored TypeScript port of
asciidoctor's inline substitution pipeline. There are two test suites:

1. **`tests/renderer.test.tsx`** — 68 hand-crafted examples in
   `src/examples/`. All green.
2. **corpus parity** — every Oxide RFD in asciidoc format (694
   docs, ~16 MB) plus the asciidoctor writer's guide. **The starting
   baseline is 80 cherry-picked RFDs at 73/80 passing**; the full 694 was
   just pulled and has NOT been triaged yet. The suite is split across
   eight shard files (`tests/corpus.0.test.tsx` … `tests/corpus.7.test.tsx`)
   so vitest's worker pool runs them in parallel — see "Running things".

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
  corpus-shard.tsx       # defineCorpusShard(index, total) — loads the
                         # corpus and registers a round-robin slice as tests
  corpus.0.test.tsx      # eight thin shard files, each calling
  …                      #   defineCorpusShard(i, 8); vitest runs them in
  corpus.7.test.tsx      #   parallel across its worker pool
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
# Just the corpus, sharded across the worker pool (~7s on 16 cores;
# was ~34s as a single file).
npx vitest run tests/corpus.*.test.tsx
# One RFD (works regardless of which shard it landed in).
npx vitest run -t "rfds/0042"

# The triage runner — best for understanding failures across the whole
# corpus at once. Prints pass/fail count and the first ~80 chars at the
# point each failing doc diverges. Use vite-node (not bare tsx) so the
# JSX transform matches what vitest does.
npx vite-node tests/triage.ts 2>/dev/null

# Refresh the corpus from rfd-cli (~30s).
./tests/fetch-corpus.sh
```

**Why eight shard files?** Vitest parallelises across test *files*, not
within one, and each corpus test is CPU-bound synchronous work (asciidoctor
convert + `renderToString`) with no IO to overlap — so `test.concurrent`
wouldn't help. With all 694 tests in one file the suite pinned a single core
(~34s); splitting them round-robin across eight files lets the worker pool
spread them over the available cores (~7s on 16). To change the shard count,
regenerate the thin files and update the `total` argument:

```bash
rm tests/corpus.*.test.tsx
N=8
for i in $(seq 0 $((N-1))); do
  printf "import { defineCorpusShard } from './corpus-shard'\n\ndefineCorpusShard(%d, %d)\n" "$i" "$N" \
    > "tests/corpus.$i.test.tsx"
done
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
- `npx vitest run tests/corpus.*.test.tsx` passes, or you've documented
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
