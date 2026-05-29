# React AsciiDoc

> **Warning** Work in progress, not ready for use

A React renderer for AsciiDoc. Built on top of
[Asciidoctor.js](https://github.com/asciidoctor/asciidoctor.js/). Designed to be equivalent
in output of the built-in HTML5 converter. Will allow for custom components to be passed in
similar to
[Custom converters in Asciidoctor.js](https://docs.asciidoctor.org/asciidoctor.js/latest/extend/converter/custom-converter/)
and custom block types.

Currently just a proof of concept, working towards style parity with the built-in converter.

## Installing

To view any of the examples first install all necessary modules:

```
npm install
```

## Previewing

You can then preview any of the examples by running `npm run dev` and visting
`http://localhost:8000/?example=[EXAMPLE]&renderer=[RENDERER]`. See
[here](https://github.com/oxidecomputer/react-asciidoc/tree/main/src/examples) for the
example names. Use `renderer=react` for the React renderer and `renderer=html` for the HTML
one.

> **Note** The example name must be identical to the file name without the file ending, it
> is case sensitive

## Running tests

The tests are string-diff parity checks: each source is converted through stock
Asciidoctor (embedded mode) and through the React renderer, then both outputs are
normalised and compared. Run the whole suite with:

```
npm test
```

There are two groups of tests under `tests/`:

- **Examples** (`renderer.test.tsx`) — the hand-crafted fixtures in `src/examples/`.
- **Corpus** (`corpus.*.test.tsx`) — every Oxide RFD plus the Asciidoctor writer's
  guide (~694 docs). Because vitest parallelises across test *files* rather than
  within one, the corpus is split into eight shard files that each run a round-robin
  slice of the documents. This lets the worker pool spread the work across cores —
  the suite runs in roughly a fifth of the time it took as a single file.

```
# Just the corpus, in parallel across the worker pool.
npx vitest run tests/corpus.*.test.tsx

# A single document, regardless of which shard it lives in.
npx vitest run -t "rfds/0042"
```

## Limitations

We do not have access to the inline nodes. They can be customised but not with React. You
can write a standard asciidoctor.js custom converter instead. Using a JSX to string
converter is planned to make it easier to create converters for inline nodes.

## Current Progress

Tests are showing the following examples are identical to the HTML5 renderer using the
[default asciidoctor stylesheet](https://github.com/asciidoctor/asciidoctor/blob/f80441fd2ad46439cce19bf54581eb9d79097f3d/src/stylesheets/asciidoctor.css).

- [x] Audio
- [x] Admonition
- [x] CoList
- [x] DList
- [x] Example
- [x] Floating Title
- [x] Inline Anchor
- [x] Inline Break
- [x] Inline Button
- [x] Inline Callout
- [x] Inline Image
- [x] Inline KBD
- [x] Inline Menu
- [x] Inline Quoteed
- [x] Listing
- [x] Literal
- [x] OList
- [x] Open
- [x] Page Break
- [x] Paragraph
- [x] Pass
- [x] Preamble
- [x] Quote
- [x] Sidebar
- [x] Thematic Break
- [x] Toc
- [ ] Document
- [ ] Embedded
- [ ] Image
- [ ] Inline Footnote
- [ ] Outline
- [ ] Section
- [ ] Stem
- [ ] Table
- [ ] Video
