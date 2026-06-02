# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Project

`@oxide/react-asciidoc` is a React renderer for AsciiDoc built on top of
[Asciidoctor.js](https://github.com/asciidoctor/asciidoctor.js/). It aims for visual output
parity with Asciidoctor's built-in HTML5 converter while letting consumers replace
individual block templates with React components.

## Commands

- `npm run dev` — Vite dev server on port 8000. Visit
  `http://localhost:8000/?example=<EXAMPLE>&renderer=<react|html>` where `<EXAMPLE>` is the
  case-sensitive name of a file in `src/examples/` (without extension).
- `npm run build` — Cleans `dist/`, builds the library bundle (es + umd) via Vite, then
  emits `.d.ts` via `tsc`.
- `npm run tsc` — Type check only.
- `npm run fmt` / `npm run fmt:check` — Prettier write / check.
- `npm test` — Runs the vitest string-diff suite (`tests/renderer.test.tsx`). For each
  example in `src/examples/*.js`, it converts the source through stock asciidoctor in
  embedded mode and through the React renderer (`renderToString(<Content blocks={…} />)`),
  then normalises insignificant whitespace and compares. Failures are template-level parity
  gaps, not framework problems — use them to drive React templates toward stock parity.
- Run a single example's diff: `npx vitest run -t <exampleName>` (e.g.
  `npx vitest run -t paragraph`).

## Architecture

This is a published library. The library entry point is `src/asciidoc/index.tsx` (also the
Vite library `lib.entry`); `src/App.tsx` and `src/main.tsx` exist only to power the dev
server / visual-diff tests and are **not** shipped.

Rendering pipeline:

1. Consumer calls `asciidoctor()` from `@asciidoctor/core` and `ad.load(content, ...)` to
   get an Asciidoctor AST.
2. That AST is passed through `prepareDocument()` (`src/asciidoc/utils/prepareDocument.ts`),
   which walks the Asciidoctor node tree and produces a serializable `DocumentBlock` of
   plain `Block` objects. For each leaf block with `simple` content model, prepareDocument
   feeds the raw source (`getSourceLines().join('\n')` for blocks, the Ruby `text` instance
   var for list items and table cells, `block.title` for titles) into the vendored inline
   parser at `src/asciidoc/inline/`, producing an `InlineNode[]` AST. The legacy HTML string
   is still kept in `content` for templates that read it directly.
3. `<Asciidoc document={preparedDoc} options={...} />` puts an `Options` value into a
   `Context` and renders `<Document>` (or a user-supplied `customDocument`).
4. `<Content blocks={...}>` iterates blocks and dispatches each to `<Converter>`, which
   switches on `block.type` and renders the matching template from
   `src/asciidoc/templates/`. Before the switch, it checks `options.overrides[block.type]`
   and prefers that component when supplied.
5. Inline content is rendered as a real React tree via `<RenderInline nodes={…} />`, which
   walks the AST and emits actual elements (and routes each subtype through its
   `options.inlineOverrides` component when supplied). This is a React renderer, so the
   React tree is the default. Templates fall back to the legacy HTML-string path
   (`dangerouslySetInnerHTML={inlineHtml(node.inlines)}`) only when the AST carries
   _straddling_ passthrough HTML — `hasRawInline()` in `RenderInline.tsx` detects it, and
   the shared `useInlineRenderMode()` hook makes the choice. Registered overrides always
   force the React path.

Why a fallback path at all? React's `parse()` / JSX children path decodes HTML entities
(`&#8217;` → `'`) — harmless, because the test harness decodes entities on both sides — but
it renders the AST node-by-node, so it can't reconstruct an HTML element whose open and
close tags straddle sibling inline nodes. That happens with partial-subs passthroughs like
`pass:q[<u>x *y*</u>]`, which parse to a text `<u>x `, a `<strong>y</strong>`, then a text
`</u>`. Only re-serialising the whole sequence to one string and injecting it via
`dangerouslySetInnerHTML` keeps that intact. `hasRawInline()` flags this (explicit `raw`
text nodes, or any text node still holding a bare `<`/`>` after the substitution pipeline
escaped all the real ones), and the template uses the string path for that block. When you
add a new template that renders `node.inlines`, drive the choice through
`useInlineRenderMode()` rather than hard-coding either path.

Some block-level invariants that come back to bite if you change them:

- Section anchors and links are controlled by `:sectanchors:` and `:sectlinks:` doc
  attributes — only emit the inner `<a class="anchor">` / `<a class="link">` markup when
  those are set. `sect1` wraps children in `<div class="sectionbody">`; `sect2+` render
  children directly.
- Title text (block titles, section titles, captions, TOC entries) must go through
  `dangerouslySetInnerHTML` so entities like `&#8217;` and `&#43;` survive. `Title` util and
  `Outline` already do this.
- The inline parser doesn't have document context, so `<<id>>` xrefs to sections without an
  explicit reftext render as `[id]`. `prepareDocument` walks the AST after parsing and
  rewrites those to the target section's title (it builds the id→title map from
  `document.getSections()` recursively).
- `getBlocks()` and `getItems()` on `olist` / `ulist` / `colist` / `dlist` return the SAME
  items. `prepareDocument` only walks `getItems()` for list containers — walking both would
  parse each item twice and bump the document-wide footnote counter on every visit.
- Footnote indices are shared across the whole document via `inlineState`. Titles use a
  throwaway state since asciidoctor doesn't number footnotes in titles.
- For boolean HTML attributes React emits `attr=""`; `data-*` boolean-shaped attributes work
  as expected. The test harness normalises `attr=""` to bare `attr` for
  `reversed | disabled | checked | …` and lowercases `colSpan` / `rowSpan`. If you add a new
  boolean attribute, extend that list.
- React 19's renderer auto-injects `<link rel="preload" as="image">` for every `<img>` it
  sees server-side. The test harness strips these. Don't be surprised by them in
  `renderToString` output.
- For media (`audio`, `video`) and the `<table>` caption, the templates emit HTML directly
  into `dangerouslySetInnerHTML` rather than going through JSX — React serialises `controls`
  / `autoplay` / `loop` and table cell `colspan` / `rowspan` in ways that disagree with
  stock asciidoctor's output.

Vendored inline parser (`src/asciidoc/inline/`): TypeScript port of Asciidoctor's inline
substitution pipeline that converts an AsciiDoc inline string to an `InlineNode[]` tree,
then optionally renders to HTML5-equivalent output. Mirrors `apply_normal_subs` from Ruby
Asciidoctor — passthroughs, specialchars, quotes, attributes, replacements, macros,
post-replacements. Don't reorder the substitution pipeline in `inline/parser.ts` without
confirming nothing regresses; the order matches Ruby's `apply_subs` and the placeholder
sentinels (`\x01…\x02` for quotes, `…` for passthroughs) carry meaning across passes.

To override inline subtypes, pass `options.inlineOverrides` to `<Asciidoc>`. Keys are
`quoted | anchor | image | footnote | indexterm | callout | break | button | kbd | menu`;
values are React components receiving `{ node, children? }`. See
`src/asciidoc/RenderInline.tsx` for the override contract.

Adding a new block type:

1. Add the type name to the `NodeType` union and (if it carries extra fields) define a typed
   `Block` variant in `src/asciidoc/utils/prepareDocument.ts`, then handle it in the
   recursive walker there.
2. Create the template component in `src/asciidoc/templates/<Name>.tsx` and re-export it
   from `templates/index.ts`.
3. Add a `case '<type>':` to the `Converter` switch in `src/asciidoc/index.tsx` and the
   matching key to the `Overrides` type.
4. Add an example fixture in `src/examples/<name>.js`, re-export it from
   `src/examples/index.js`. The vitest harness picks examples up automatically; run
   `npm test` to see whether stock asciidoctor and the React renderer produce equivalent
   HTML for the new fixture.

## Conventions

- Prettier config: 92 col width, no semicolons, single quotes, trailing commas. Imports are
  auto-sorted by `@trivago/prettier-plugin-sort-imports` with `^~/(.*)$` then `^[./]` groups
  separated by blank lines.
- ESLint ignores `.js` files (the examples are intentionally JS). It enforces `eqeqeq`,
  `no-param-reassign`, `no-return-assign`, and unused-vars (allowing `_`-prefixed args).
- Releases use `auto shipit` (`npm run release`); version bump and CHANGELOG commits are
  made automatically — don't edit `CHANGELOG.md` or bump `package.json` version by hand.
