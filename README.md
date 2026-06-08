# `@oxide/react-asciidoc`

A React renderer for [AsciiDoc](https://asciidoc.org/), built on top of
[Asciidoctor.js](https://github.com/asciidoctor/asciidoctor.js/). It parses a document with
stock Asciidoctor, walks the resulting AST into a plain serialisable tree, and renders that
tree with React components. The goal is to reproduce the HTML of Asciidoctor's built-in
HTML5 converter while letting you swap individual block and inline templates for your own
React components.

It's aimed at rendering AsciiDoc documents for the web — a document at a time — when you
want real React components in the output instead of a string of HTML.

Built and maintained at [Oxide](https://oxide.computer).

## Status

Output is checked against stock Asciidoctor with a diff suite: each document is converted
both ways and the HTML compared. Current results:

- **Examples:** 78 / 79 hand-written fixtures match (including the full Asciidoctor writer's
  guide). The lone miss is a table using `{set:cellbgcolor}`.
- **Corpus:** 1894 / 2001 real-world documents match (~95%) — a mix of Oxide RFDs and
  Asciidoctor's own test fixtures.

Every block and inline type the HTML5 converter emits is implemented. The remaining
mismatches are a small set of edge cases — see [Known differences](#known-differences). If
your content steers clear of those, the output matches Asciidoctor.

## Installation

```
npm install @oxide/react-asciidoc @asciidoctor/core
```

`@asciidoctor/core`, `react`, and `react-dom` are peer dependencies (React 18 or 19).

## Usage

The flow is always: load the source with Asciidoctor → `prepareDocument(doc)` → render
`<Asciidoc>`.

```tsx
import asciidoctor from '@asciidoctor/core'
import { Asciidoc, prepareDocument } from '@oxide/react-asciidoc'

const ad = asciidoctor()

function Page({ source }: { source: string }) {
  const doc = ad.load(source, {
    standalone: true,
    attributes: { sectlinks: 'true', icons: 'font' },
  })
  const prepared = prepareDocument(doc)
  return <Asciidoc document={prepared} />
}
```

`prepareDocument` returns a plain, JSON-serialisable `DocumentBlock`. You can run
`ad.load` + `prepareDocument` on a server (or at build time), serialise the result, and
hydrate `<Asciidoc>` on the client without shipping Asciidoctor.js to the browser.

> Asciidoctor's default stylesheet is not injected. Pull in
> [`asciidoctor.css`](https://github.com/asciidoctor/asciidoctor/blob/main/data/stylesheets/asciidoctor.css)
> (or your own) to style the output.

### Block-level overrides

Replace the component used for any block type via `options.overrides`. Your component
receives the prepared `node`; render `<Content blocks={node.blocks} />` to recurse into
children.

```tsx
import { Asciidoc, type Block, Content, type DocumentBlock } from '@oxide/react-asciidoc'

function Callout({ node }: { node: Block }) {
  return (
    <aside className={`callout callout-${node.attributes?.name}`}>
      <Content blocks={node.blocks} />
    </aside>
  )
}

function Doc({ document }: { document: DocumentBlock }) {
  return <Asciidoc document={document} options={{ overrides: { admonition: Callout } }} />
}
```

Override keys are the block type names:

```
admonition · audio · colist · dlist · example · floating_title · image · listing ·
literal · olist · open · page_break · paragraph · pass · preamble · quote · section ·
sidebar · stem · table · toc · thematic_break · ulist · verse · video
```

### Inline-level overrides

Inline content (emphasis, links, footnotes, etc.) is parsed into its own AST. By default
it's rendered to an HTML string, which is the form that matches Asciidoctor most precisely.
To render individual inline nodes as React components instead, pass
`options.inlineOverrides`:

```tsx
import { Asciidoc, type DocumentBlock, type InlineOverrides } from '@oxide/react-asciidoc'

const inlineOverrides: InlineOverrides = {
  // node.subtype is 'link' | 'xref' | 'ref' | 'bibref'
  anchor: ({ node, children }) =>
    node.subtype === 'xref' ? (
      <a className="xref" href={node.target}>
        {children}
      </a>
    ) : (
      <a href={node.target}>{children}</a>
    ),
}

function Doc({ document }: { document: DocumentBlock }) {
  return <Asciidoc document={document} options={{ inlineOverrides }} />
}
```

Override keys (with the node passed to each):

```
quoted · anchor · image · footnote · indexterm · callout · break · button · kbd · menu
```

`quoted` covers
`emphasis | strong | monospaced | mark | superscript | subscript | double | single | unquoted`
(distinguished by `node.subtype`).

#### Bibliography cross-references as direct links

When an `<<id>>` cross-reference resolves to a `[bibliography]` entry whose citation carries
a URL, `prepareDocument` records that URL on the anchor node as `node.externalHref`. The
default output is unchanged (it still links to the in-page `#id` anchor, matching
Asciidoctor), but an `anchor` override can read `externalHref` to link straight to the
external resource instead:

```asciidoc
See <<pegjs>> for the parser generator.

[bibliography]
== References

- [[[pegjs]]] PEG.js https://pegjs.org
```

```tsx
const inlineOverrides: InlineOverrides = {
  anchor: ({ node, children }) =>
    node.subtype === 'xref' && node.externalHref ? (
      <a href={node.externalHref} target="_blank" rel="noopener">
        {children}
      </a>
    ) : (
      <a href={node.target.startsWith('#') ? node.target : `#${node.target}`}>{children}</a>
    ),
}
```

`externalHref` is only set when the reference resolves to that entry under stock rules; an
unresolved citation is left as the normal fallback.

Alongside `externalHref`, `prepareDocument` also records the entry's citation body on the
anchor as `node.referenceInlines` — the entry's inline AST with the leading `[[[id]]]`
bibref label stripped (the free text and links that follow it). It is set for every xref
that resolves to a `[bibliography]` entry, whether or not the citation carries a URL. The
default renderer ignores it (preserving stock parity); an `anchor` override can render it
through `<RenderInline>` to show the reference's content in a hover tooltip:

```tsx
import { RenderInline } from '@oxide/react-asciidoc'

const inlineOverrides: InlineOverrides = {
  anchor: ({ node, children }) =>
    node.subtype === 'xref' && node.referenceInlines ? (
      <Tooltip content={<RenderInline nodes={node.referenceInlines} />}>
        <a href={`#${node.target}`}>{children}</a>
      </Tooltip>
    ) : (
      <a href={node.target.startsWith('#') ? node.target : `#${node.target}`}>{children}</a>
    ),
}
```

> **Inline overrides change the inline output path.** Without them, inline content is
> emitted as an HTML string and matches Asciidoctor exactly. Supplying any `inlineOverrides`
> switches to a React element tree, which entity-decodes text (e.g. `&#8217;` renders as a
> literal `'`). The visible result is the same, but the HTML is no longer
> character-for-character identical to Asciidoctor — leave `inlineOverrides` unset if you
> need an exact match.

### Custom document shell

`options.customDocument` replaces the outer document component (header, TOC, footnotes
section) while still using the built-in block templates for the body. See `src/App.tsx` and
`tests/helpers.tsx` for a worked example.

### Other exports

| Export                  | Purpose                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `Content`               | Renders an array of blocks; use inside block overrides to recurse.                    |
| `RenderInline`          | Renders an inline AST (`node.inlines`) as a React tree (honours `inlineOverrides`).   |
| `inlineHtml`            | Renders an inline AST to an HTML string (`{ __html }`) for `dangerouslySetInnerHTML`. |
| `Inline`                | The standalone inline parser/renderer (`parseInline`, `renderInline`).                |
| `prepareDocument`       | Asciidoctor AST → serialisable `DocumentBlock`.                                       |
| `processDocument`       | Walk/transform the prepared tree (e.g. to post-process listing blocks).               |
| Block templates & types | `Paragraph`, `Listing`, …, `ParagraphBlock`, `ListingBlock`, … re-exported.           |

## How it works

1. You call `ad.load(...)` to get an Asciidoctor AST.
2. `prepareDocument()` walks that tree into plain `Block` objects. For each leaf block it
   feeds the raw source through a vendored TypeScript port of Asciidoctor's inline
   substitution pipeline (`src/asciidoc/inline/`), producing an `InlineNode[]` AST.
3. `<Asciidoc>` puts options into context and renders `<Document>` (or your
   `customDocument`).
4. `<Content>` dispatches each block to its template, preferring `options.overrides`.
5. Inline content renders via `inlineHtml` + `dangerouslySetInnerHTML` (the default, closest
   to Asciidoctor) or, when `inlineOverrides` are set, via `<RenderInline>` (a React tree).

## Limitations

- **Inline parsing is reimplemented, not delegated.** To expose inline nodes to React we
  vendored Asciidoctor's substitution pipeline rather than calling its converter. It mirrors
  `apply_normal_subs` closely, but a few constructs that rely on Asciidoctor's sequential
  `gsub` model don't round-trip perfectly — see [Known differences](#known-differences).
- **The default stylesheet is not bundled.**
- **Inline overrides change the inline output path** (see above).
- **No file-system features.** `include::` directives are resolved by Asciidoctor at
  `ad.load` time; this library never touches the file system itself. An unresolved
  `include::` becomes a link, exactly as in stock Asciidoctor.
- **Syntax highlighting is left to you.** Source blocks emit
  `<pre class="highlight"><code class="language-…">`; run a client-side highlighter (e.g.
  highlight.js, Shiki) over that. Server-side `source-highlighter` backends
  (Rouge/CodeRay/Pygments) are not reproduced.

## Known differences

The ~107 corpus mismatches fall into the buckets below. Each shows a minimal source, what
**Asciidoctor** emits, and what this renderer emits.

### More likely to surface

**1. Escaped `\#` in inline monospace** — authors escape `#` (the highlight delimiter) so a
literal `#` survives in code, e.g. when documenting Rust attributes.

```
`\#[endpoint]` is the macro.
```

Asciidoctor strips the backslash in some block contexts and keeps it in others, so the
expected output depends on context. We always keep it literal:

```html
<!-- asciidoctor (in a paragraph after other text): -->
<code>#[endpoint]</code>
<!-- this renderer:                                  -->
<code>\#[endpoint]</code>
```

Where you can, writing the literal `#` unescaped avoids the difference.

**2. Highlight (`#…#`) spanning multiple inline code spans.** Two `#` characters across
separate code spans on one line are treated as a `<mark>` pair:

```
use `#[a]` ... `#[b]` here
```

```html
<!-- asciidoctor (the mark tags interleave across the code spans): -->
use <code><mark>[a]</code>…<code></mark>[b]</code>here
<!-- this renderer (no mark applied): -->
use <code>#[a]</code>…<code>#[b]</code>here
```

Comes up when a line of prose has two pieces of inline code that each contain a `#` (again,
Rust attributes are a common case). The two outputs differ.

**3. Sentinel / placeholder leak (bug).** In rare combinations — e.g. a bare URL whose
fragment looks like a callout — an internal placeholder can leak into the output:

```html
<!-- asciidoctor: -->
…slack#verifying-requests…
<!-- this renderer: -->
…slack&lt;0&gt;verifying-requests…
```

Rare (seen once in ~700 documents), but it produces visibly wrong output when hit. This is a
bug on our side, not a feature gap.

**4. Footnote edge cases.** Footnotes defined in section titles are numbered out of
sequence, and a footnote defined inside an AsciiDoc table cell can be mis-shared with the
main document. Can surface in long documents that footnote heavily.

### Rarely an issue

| Difference                                                                                                          | Example                            | Asciidoctor                  | This renderer                     | Notes                                                 |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------- | --------------------------------- | ----------------------------------------------------- |
| Inline formatting straddling a span boundary                                                                        | `` `a __b` c__ ``                  | `<code>a <em>b</code>c</em>` | `<code>a __b</code>c__`           | Rare in practice.                                     |
| `manpage` doctype                                                                                                   | `:doctype: manpage` + NAME section | special NAME header block    | rendered as ordinary sections     | Only relevant if you render man pages (~12 failures). |
| `source-highlighter` with a `>` in the language token                                                               | `[source,console?prompt=$>]`       | `data-lang="…$>"` (raw)      | `data-lang="…$&gt;"`              | Needs an unusual language token.                      |
| Server-side highlighter markup (Rouge/CodeRay)                                                                      | `:source-highlighter: rouge`       | per-token `<span>` markup    | plain `<code class="language-…">` | Highlight on the client instead.                      |
| `xref` nested inside another link's text                                                                            | `link:…[… <<id>> …]`               | resolved `<a>`               | literal `&lt;&lt;id&gt;&gt;`      | Uncommon nesting.                                     |
| `{set:cellbgcolor}`, nested-document table cells, compat-mode toggling, `pass:` inside a body-level attribute value | —                                  | —                            | —                                 | Rare/legacy features.                                 |
| Audio/video `controls`/`autoplay`/`loop` attribute casing                                                          | `audio::…[] controls`              | `controls` (bare)            | `controls=""` via React           | Default templates use raw HTML to match Asciidoctor; override `options.overrides.audio` / `video` to use React elements instead. |
| `inlineOverrides` silently bypassed for blocks with straddling passthrough HTML                                     | `` pass:q[<u>x *y*</u>] ``         | `<u>x <strong>y</strong></u>` | same (string path, no override)  | Any `<`/`>` in the inline AST triggers the HTML-string fallback, bypassing registered `inlineOverrides` for that block. |

For ordinary technical prose — code blocks, tables, admonitions, lists, links, images,
xrefs, and footnotes — output should match Asciidoctor. The things most worth watching are
the two `#`-related cases above (inline code containing `#`) and the placeholder-leak bug.

## Development

### Previewing

```
npm install
npm run dev
```

Visit `http://localhost:8000/?example=<EXAMPLE>&renderer=<react|html>`, where `<EXAMPLE>` is
a file in `src/examples/` (case-sensitive, no extension). `renderer=react` uses this
renderer; `renderer=html` uses stock Asciidoctor, for side-by-side comparison.

### Running tests

The suite is the diff-against-Asciidoctor check described in [Status](#status):

```
npm test                                 # everything
npx vitest run tests/renderer.test.tsx   # just the hand-written examples
npx vitest run tests/corpus.*.test.tsx   # just the corpus (sharded across the worker pool)
npx vitest run -t "rfds/0042"            # a single document, whichever shard it's in
```

The corpus is split into eight shard files so vitest can parallelise across cores (it
parallelises across files, not within one).

For triaging failures without the test framework:

```
npx vite-node tests/triage.ts 2>/dev/null                  # pass/fail + first divergence per doc
npx vite-node tests/triage.ts -- --group --summary         # counts grouped by category
npx vite-node tests/triage.ts -- --filter "tables_test"    # restrict to matching docs
```

### Fetching the corpus

The corpus lives under `tests/corpus/` and is **git-ignored** — you fetch it locally. It has
two parts:

- `tests/corpus/rfds/` — Oxide RFDs, pulled with the
  [`rfd-cli`](https://github.com/oxidecomputer/rfd-api). **~80 RFDs are currently public**;
  internal access yields more.
- `tests/corpus/asciidoctor-extracted/` — fixtures lifted from Asciidoctor's own test suite
  (optional; used to exercise feature edge cases).

To pull the RFDs, install `rfd-cli` from the
[rfd-api repo](https://github.com/oxidecomputer/rfd-api), point it at the public host, and
run the fetch script:

```
rfd-cli config set host https://rfd-api.shared.oxide.computer

# RFD_CLI defaults to ~/Development/rfd-cli; override if yours lives elsewhere.
RFD_CLI=$(command -v rfd-cli) ./tests/fetch-corpus.sh
```

The script lists every AsciiDoc-format RFD (`rfd-cli list`), writes each to
`tests/corpus/rfds/NNNN.adoc` (`rfd-cli view --number N`), and skips empty bodies. Re-run
any time to refresh. With no corpus present, the corpus shard tests simply find no
documents; the example suite (`renderer.test.tsx`) always runs.

## Conventions

- Prettier: 92-column width, no semicolons, single quotes, trailing commas.
- ESLint ignores `.js` files (the examples are intentionally plain JS).
- Releases use `auto shipit` (`npm run release`); the version bump and `CHANGELOG.md` are
  generated — don't edit them by hand.
