# React AsciiDoc

WIP
A React renderer for AsciiDoc. Designed to be equivalent in output of the built-in HTML5 converter.
Will allow for custom components to be passed in similar to [Custom converters in Asciidoctor.js](https://docs.asciidoctor.org/asciidoctor.js/latest/extend/converter/custom-converter/) and custom block types.

Currently just a proof of concept, working towards style parity with the built-in converter.

## Installing
To view any of the examples first install all necessary modules:

```
npm install
```

## Previewing

You can then preview any of the examples by running `npm run dev` and visting `http://localhost:8000/?example=[EXAMPLE]&renderer=[RENDERER]`. See [here](https://github.com/oxidecomputer/react-asciidoc/tree/main/src/examples) for the example names. Use `renderer=react` for the React renderer and `renderer=html` for the HTML one. 

> **_NOTE:_**  The example name must be identical to the file name without the file ending, it is case sensitive

## Running tests
Before running the full set of tests we must first generate the screenshots. The tests are running a visual diff on the original renderer and the React one. You must therefore run the following command first:

```
npm run test:init
```

This will produce an error on first run; this is expected, as it needs to generate the screenshots. You should then run the following command, which runs all of the React renderer tests, comparing them to the baseline.

```
npm run test:run
```

![Uploading ezgif-2-3313785e65.gif…](GIF of the visual diff tests)

## Limitations
We do not have access to the inline nodes. They can be customised but not with React. You can write a standard asciidoctor.js custom converter instead. Using a JSX to string converter is planned to make it easier to create converters for inline nodes.

## Current Progress
Tests are showing the examples are identical for the following examples:

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
