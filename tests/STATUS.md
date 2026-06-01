# Test status snapshot

A checked-in baseline of the suite results so runs can be diffed. Update it
whenever the failing set changes (after a fix or a regression) and commit the
delta alongside the code change — the git diff of this file is the record of
what flipped.

**Last updated:** 2026-06-01

## Totals

| Suite                                   | Result          |
| --------------------------------------- | --------------- |
| Examples (`tests/renderer.test.tsx`)    | **79 / 79** ✅  |
| Corpus (`tests/corpus.*.test.tsx`)      | **1894 / 2001** |
| Corpus failures                         | **107**         |

## Regenerate

```bash
npm test                                            # examples
npx vite-node tests/triage.ts 2>/dev/null | grep -E '^(pass|fail):'   # corpus totals
npx vite-node tests/triage.ts -- --group --summary 2>/dev/null       # category counts
# Full sorted failing list (the diff artifact below):
npx vite-node tests/triage.ts 2>/dev/null \
  | grep -oE '(rfds|asciidoctor-extracted|writers-guide)/[^ ]+\.adoc' | sort
```

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
doctype, nested AsciiDoc table cells). See the project HANDOFF for the deeper
analysis.

## Failing documents (107) — the diff artifact

### rfds/ (33)

```
rfds/0144.adoc
rfds/0148.adoc
rfds/0159.adoc
rfds/0160.adoc
rfds/0165.adoc
rfds/0206.adoc
rfds/0215.adoc
rfds/0234.adoc
rfds/0250.adoc
rfds/0268.adoc
rfds/0327.adoc
rfds/0353.adoc
rfds/0364.adoc
rfds/0370.adoc
rfds/0396.adoc
rfds/0476.adoc
rfds/0479.adoc
rfds/0524.adoc
rfds/0528.adoc
rfds/0539.adoc
rfds/0567.adoc
rfds/0579.adoc
rfds/0580.adoc
rfds/0582.adoc
rfds/0585.adoc
rfds/0598.adoc
rfds/0637.adoc
rfds/0643.adoc
rfds/0658.adoc
rfds/0681.adoc
```

### asciidoctor-extracted/ (74)

```
asciidoctor-extracted/api_test/011-find-by-should-discover-blocks-inside-asciidoc-table-cells-if-traverse-documents.adoc
asciidoctor-extracted/attributes_test/002-resolves-attributes-and-pass-macro-inside-attribute-value-outside-header.adoc
asciidoctor-extracted/attributes_test/027-sets-attribute-until-it-is-deleted.adoc
asciidoctor-extracted/attributes_test/028-should-allow-compat-mode-to-be-set-and-unset-in-middle-of-document.adoc
asciidoctor-extracted/attributes_test/047-should-not-allow-counter-to-modify-built-in-locked-attribute.adoc
asciidoctor-extracted/attributes_test/048-should-not-allow-counter2-to-modify-built-in-locked-attribute.adoc
asciidoctor-extracted/blocks_test/077-should-not-mangle-array-that-contains-formatted-text-with-role-in-listing-block-.adoc
asciidoctor-extracted/blocks_test/104-should-strip-leading-and-trailing-blank-lines-when-converting-raw-block.adoc
asciidoctor-extracted/blocks_test/162-video-macro-should-use-imagesdir-attribute-to-resolve-target-and-poster.adoc
asciidoctor-extracted/blocks_test/180-should-not-recognize-fenced-code-blocks-with-more-than-three-delimiters.adoc
asciidoctor-extracted/blocks_test/200-should-be-able-to-set-subs-then-modify-them.adoc
asciidoctor-extracted/blocks_test/207-should-resolve-attribute-reference-in-title-using-attribute-defined-at-location-.adoc
asciidoctor-extracted/document_test/004-should-enable-compat-mode-for-document-with-legacy-doctitle.adoc
asciidoctor-extracted/document_test/006-should-not-enable-compat-mode-for-document-with-legacy-doctitle-if-compat-mode-i.adoc
asciidoctor-extracted/document_test/021-should-not-warn-if-implicit-document-title-contains-attribute-reference-for-attr.adoc
asciidoctor-extracted/document_test/056-should-parse-header-only-when-docytpe-is-manpage.adoc
asciidoctor-extracted/document_test/063-should-close-all-short-tags-when-htmlsyntax-is-xml.adoc
asciidoctor-extracted/document_test/068-should-apply-replacements-substitution-to-value-of-mantitle-attribute-used-in-do.adoc
asciidoctor-extracted/document_test/070-adds-refname-to-docbook-output-for-each-name-defined-in-name-section-of-manpage.adoc
asciidoctor-extracted/document_test/075-should-parse-mantitle-and-manvolnum-from-document-title-for-manpage-doctype.adoc
asciidoctor-extracted/document_test/076-should-perform-attribute-substitution-on-mantitle-in-manpage-doctype.adoc
asciidoctor-extracted/document_test/077-should-consume-name-section-as-manname-and-manpurpose-for-manpage-doctype.adoc
asciidoctor-extracted/document_test/078-should-set-docname-and-outfilesuffix-from-manname-and-manvolnum-for-manpage-back.adoc
asciidoctor-extracted/document_test/079-should-mark-synopsis-as-special-section-in-manpage-doctype.adoc
asciidoctor-extracted/document_test/080-should-output-special-header-block-in-html-for-manpage-doctype.adoc
asciidoctor-extracted/document_test/081-should-output-special-header-block-in-embeddable-html-for-manpage-doctype.adoc
asciidoctor-extracted/document_test/082-should-output-all-mannames-in-name-section-in-man-page-output.adoc
asciidoctor-extracted/invoker_test/008-should-write-page-for-each-alternate-manname.adoc
asciidoctor-extracted/links_test/035-should-not-fail-to-resolve-broken-xref-in-section-title.adoc
asciidoctor-extracted/links_test/036-should-break-circular-xref-reference-in-section-title.adoc
asciidoctor-extracted/links_test/037-should-drop-nested-anchor-in-xreftext.adoc
asciidoctor-extracted/links_test/038-should-not-resolve-forward-xref-evaluated-during-parsing.adoc
asciidoctor-extracted/links_test/039-should-not-resolve-forward-natural-xref-evaluated-during-parsing.adoc
asciidoctor-extracted/links_test/041-should-not-match-numeric-character-references-while-searching-for-fragment-in-xr.adoc
asciidoctor-extracted/lists_test/171-consecutive-terms-in-horizontal-list-should-share-same-cell.adoc
asciidoctor-extracted/lists_test/172-consecutive-terms-in-horizontal-list-should-share-same-entry-in-docbook.adoc
asciidoctor-extracted/manpage_test/001-should-replace-invalid-characters-in-mantitle-in-info-comment.adoc
asciidoctor-extracted/manpage_test/002-should-substitute-attributes-in-manname-and-manpurpose-in-name-section.adoc
asciidoctor-extracted/manpage_test/004-should-normalize-whitespace-and-skip-line-comments-before-and-inside-name-sectio.adoc
asciidoctor-extracted/paragraphs_test/012-automatically-promotes-index-terms-in-docbook-output-if-indexterm-promotion-opti.adoc
asciidoctor-extracted/paragraphs_test/013-does-not-automatically-promote-index-terms-in-docbook-output-if-indexterm-promot.adoc
asciidoctor-extracted/paragraphs_test/014-normal-paragraph-should-honor-explicit-subs-list.adoc
asciidoctor-extracted/paragraphs_test/015-normal-paragraph-should-honor-specialchars-shorthand.adoc
asciidoctor-extracted/paragraphs_test/031-quote-paragraph-should-honor-explicit-subs-list.adoc
asciidoctor-extracted/sections_test/004-should-apply-substitutions-to-title-with-attribute-references-when-registering-s.adoc
asciidoctor-extracted/sections_test/005-should-apply-substitutions-to-title-with-attribute-references-when-registering-s.adoc
asciidoctor-extracted/sections_test/006-should-not-apply-substitutions-to-title-with-attribute-references-when-parsing-s.adoc
asciidoctor-extracted/sections_test/011-should-resolve-attribute-reference-in-title-using-attribute-defined-at-location-.adoc
asciidoctor-extracted/sections_test/044-should-add-level-offset-to-section-level.adoc
asciidoctor-extracted/sections_test/050-should-number-parts-when-doctype-is-book-and-partnums-attributes-is-set.adoc
asciidoctor-extracted/sections_test/051-should-assign-sequential-roman-numerals-to-book-parts.adoc
asciidoctor-extracted/sections_test/052-should-prepend-value-of-part-signifier-attribute-to-title-of-numbered-part.adoc
asciidoctor-extracted/sections_test/053-should-prepend-value-of-chapter-signifier-attribute-to-title-of-numbered-chapter.adoc
asciidoctor-extracted/sections_test/054-should-allow-chapter-number-to-be-controlled-using-chapter-number-attribute.adoc
asciidoctor-extracted/sections_test/122-should-use-global-attributes-for-toc-title-toc-class-and-toclevels-for-toc-macro.adoc
asciidoctor-extracted/sections_test/123-should-honor-id-title-role-and-level-attributes-on-toc-macro.adoc
asciidoctor-extracted/substitutions_test/001-should-use-the-imagesdir-attribute-defined-on-image-macro-when-resolving-image-p.adoc
asciidoctor-extracted/substitutions_test/008-footnotes-in-headings-are-expected-to-be-numbered-out-of-sequence.adoc
asciidoctor-extracted/syntax_highlighter_test/043-should-default-to-plain-text-lexer-if-lexer-cannot-be-resolved-for-language.adoc
asciidoctor-extracted/tables_test/018-does-not-assign-column-width-for-autowidth-columns-in-html-output.adoc
asciidoctor-extracted/tables_test/019-can-assign-autowidth-to-all-columns-even-when-table-has-a-width.adoc
asciidoctor-extracted/tables_test/020-equally-distributes-remaining-column-width-to-autowidth-columns-in-docbook-outpu.adoc
asciidoctor-extracted/tables_test/036-should-normalize-frame-value-topbot-as-ends-when-converting-to-html.adoc
asciidoctor-extracted/tables_test/037-should-preserve-frame-value-topbot-when-converting-to-docbook.adoc
asciidoctor-extracted/tables_test/051-styles-not-applied-to-header-cells.adoc
asciidoctor-extracted/tables_test/064-should-not-split-paragraph-at-line-containing-only-blank-that-is-directly-adjace.adoc
asciidoctor-extracted/tables_test/068-doctype-can-be-set-in-asciidoc-table-cell.adoc
asciidoctor-extracted/tables_test/069-should-reset-doctype-to-default-in-asciidoc-table-cell.adoc
asciidoctor-extracted/tables_test/070-should-update-doctype-related-attributes-in-asciidoc-table-cell-when-doctype-is-.adoc
asciidoctor-extracted/tables_test/084-footnotes-should-not-be-shared-between-an-asciidoc-table-cell-and-the-main-docum.adoc
asciidoctor-extracted/tables_test/086-compat-mode-can-be-activated-in-asciidoc-table-cell.adoc
asciidoctor-extracted/tables_test/087-compat-mode-in-asciidoc-table-cell-inherits-from-parent-document.adoc
asciidoctor-extracted/tables_test/088-compat-mode-in-asciidoc-table-cell-can-be-unset-if-set-in-parent-document.adoc
asciidoctor-extracted/tables_test/092-should-be-able-to-enable-toc-in-an-asciidoc-table-cell.adoc
asciidoctor-extracted/tables_test/093-should-be-able-to-enable-toc-in-an-asciidoc-table-cell-even-if-hard-unset-by-api.adoc
asciidoctor-extracted/tables_test/094-should-be-able-to-enable-toc-in-both-outer-document-and-in-an-asciidoc-table-cel.adoc
asciidoctor-extracted/tables_test/096-cell-background-color.adoc
```
