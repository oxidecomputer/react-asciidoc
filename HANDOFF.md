# Handoff: Corpus parity progress

## Status

- Examples suite: **78/79** passing (only `writersGuide` — architectural em-in-em nesting
  limit).
- Corpus: **1845/2001** passing (156 failures: 35 rfds + 121 asciidoctor-extracted).
- No `getContent()`, `getText()`, `applySubstitutions()`, or `contentCache` in `src/`.

## Running things

```bash
npm test                                        # examples (quick)
npx vitest run tests/corpus.*.test.tsx          # full corpus (~7s)
npx vitest run -t "rfds/0042"                   # single doc by name
npx vitest run -t "asciidoctor-extracted/tables_test"  # single subdir
npx vite-node tests/triage.ts 2>/dev/null       # triage: pass/fail + diffs
npx vite-node tests/triage.ts -- --group        # grouped by category
npx vite-node tests/triage.ts -- --group --summary  # counts only
npx vite-node tests/triage.ts -- --filter "tables_test"  # subset
```

## Failure categories (156 total, easiest → hardest to fix)

### Easy — already fixed ✅

| #   | Category                                 | Description                                                                                       | Fix                                                                                                       |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 3   | **Collapsible `<details open>`**         | `isOption(attrs,'open')` instead of `attrs.open`                                                  | Was already fixed before this session                                                                     |
| 2   | **Open/Example block `[object Object]`** | `inlineHtml()` returns `{__html: string}` but templates wrapped it as `{__html: inlineHtml(...)}` | Use `dangerouslySetInnerHTML={inlineHtml(...)}` directly                                                  |
| 1+  | **Verse block rendering**                | Verse blocks used `subCallouts(subSpecialchars())` (verbatim) instead of inline parser            | Parse inline content, render via `inlineHtml(node.inlines)`                                               |
| 3   | **Interactive checklist**                | `[options="interactive"]` should render `<input type="checkbox">`                                 | Added `isInteractive` check in UList template                                                             |
| 3   | **Callout HTML comment guards**          | `<!--N-->` pattern not recognized by `subCallouts`                                                | Added regex for `&lt;!--N--&gt;` pattern before the line-callout regex                                    |
| 3+  | **Per-block subs (callouts toggle)**     | Listing/literal always applied callouts; `subs="specialcharacters"` should suppress them          | Read `getSubstitutions()`, only apply callouts when `callouts` in subs; use inline parser for quotes/subs |
| 3   | **Callout line-comment prefix**          | Blocks with `line-comment=%` or `line-comment=-#` didn't strip prefix                             | Pass `line-comment` attribute through to `subCallouts`; `line-comment=` disables prefix recognition       |
| 1   | **Passthrough block with subs**          | `[subs="attributes,quotes,macros"]` pass blocks rendered raw instead of parsed                    | Parse inline content when subs include inline types                                                       |
| 1   | **Escaped callout markers**              | `\<1>` should render as `&lt;1&gt;` with prefix intact, not strip the backslash char              | Fixed to preserve prefix and emit `&lt;N&gt;` correctly                                                   |
| 6   | **Counter attributes in body text**      | `{counter:...}` not resolved or mis-seeded; `:name: N` should seed counter                        | `resolveNodeAttributes()` post-processing + `counterSeeds` source-order tracking for `:name: N` seed      |

### Remaining — Medium — feature gaps

| #   | Category                                  | Description                                                                                                                                |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 15  | **Include macro**                         | `link:path[]` with `class="include"` resolves to file contents in stock; we emit a bare link. Needs file system / virtual file resolution. |
| ~8  | **Stem blocks**                           | Asciimath/latexmath delimiters, `\n` splitting, already-present delimiters.                                                                |
| 6   | **Footnote numbering**                    | Duplicate `_footnotedef_1` IDs with different text; our dedup keeps last. Also some unresolved footnote contexts.                          |
| ~5  | **Backslash escape in monospace**         | `\#`/`\]` only stripped when later `#…#`/`]` pair forms.                                                                                   |
| 4   | **`{set:}` attribute directive**          | `{set:a}` should set/delete attributes and optionally suppress the line. Requires body-level attribute processing.                         |
| 4   | **Source highlighter**                    | Code blocks with `source-highlighter` or `coderay` produce different class structures.                                                     |
| 2   | **`{attribute}` references in body text** | A few edge cases where mid-document attributes aren't resolved (compat-mode toggling, pass macro inside attr values).                      |
| 2   | **Passthrough macro**                     | `pass:quotes[...]` not processed inside listing blocks with explicit subs.                                                                 |
| 1   | **Counter value wrong**                   | Fixed in this session. See key fixes #9.                                                                                                   |
| 1   | **iframe attribute normalisation**        | React emits `frameBorder` (camelCase); stock has `frameborder` and `onmousewheel=""`.                                                      |

### Remaining — Hard — architectural limits of inline parser

| #    | Category                                                                     | Description                                                                         |
| ---- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| ~20  | **Mono/em/strong/mark nesting**                                              | Formatting straddling span boundaries (`*\`bold\`\*`) dropped by placeholder model. |
| 2    | **Backslash escape: hash**                                                   | `\#` edge cases in monospace contexts.                                              |
| 2    | **Mark nesting**                                                             | `#[text]#` with `[` delimiter conflicts.                                            |
| 2    | **Source highlighter listing**                                               | `source-highlighter` producing different markup (777, 259).                         |
| 1    | **Unresolved xref**                                                          | `<<id>>` fallback rendering edge case.                                              |
| 1    | **Code crossed with em**                                                     | Nesting code inside em across boundary.                                             |
| 1    | **Sentinel leak**                                                            | `\x01/\x02` placeholders surviving in URLs.                                         |
| ~113 | **Other (manpage doctype, compat-mode, abstract blocks, video macro, etc.)** | Various feature gaps.                                                               |

## Key fixes in this session

1. **`inlineHtml()` misuse in Open/Example templates** — `inlineHtml()` returns
   `{__html: string}` but templates wrapped it as `{__html: inlineHtml(...)}`, producing
   `[object Object]`. Fixed to use `dangerouslySetInnerHTML={inlineHtml(...)}` directly.
2. **Verse block inline parsing** — Verse blocks (contentModel `verbatim` but subs=normal)
   now parse inline content instead of using verbatim `subCallouts(subSpecialchars())`.
   Template renders via `inlineHtml(node.inlines)`.
3. **Interactive checklist** — Added `isInteractive` flag to UList; renders
   `<input type="checkbox">` when `[options="interactive"]` is set.
4. **Callout HTML comment guards** — `subCallouts` now recognizes `&lt;!--N--&gt;` patterns
   (after `subSpecialchars`) in addition to the existing line-comment-prefix format.
5. **Per-block subs for listing/literal** — Read `block.getSubstitutions()` to decide which
   subs to apply: skip `callouts` when not in subs; use inline parser when
   `quotes`/`attributes`/`macros` subs are present.
6. **Passthrough block with explicit subs** — `[subs="attributes,quotes,macros"]` pass
   blocks now parse inline content instead of emitting raw source.
7. **Attribute resolution in quoted text** — Added `resolveNodeAttributes()` post-processing
   step to resolve `{attr}` references inside quoted/linked text that were hidden behind
   placeholders during the main pipeline.
8. **Escaped callout backslash** — `\<1>` in source now correctly renders as `&lt;1&gt;`
   (escaped callout) instead of mangling the prefix.
9. **Counter attribute seeding** — `:name: 10` in document body now seeds the
   `{counter:name}` counter so it increments from the specified value (10→11). Added
   `counterSeeds` source-order tracking in `prepareDocument` and lookup in `subAttributes`.
10. **Callout line-comment prefix** — `subCallouts` now accepts a `lineComment` parameter
    from the block's `line-comment` attribute; `line-comment=` disables prefix recognition.

## Earlier fixes (previous sessions)

1. **Table cell footnote doubling** — `cellContent` re-parsed inline content, doubling
   counters. Fixed by deriving from already-parsed `cellInlines`. (5 rfd fixes)
2. **Collapsible `<details open>`** — Used `isOption(attrs, 'open')` instead of
   `attrs.open`. (1 fix)

## Conventions

- Prettier: 92 col width, no semicolons, single quotes, trailing commas.
- ESLint ignores `.js` (examples). Enforces `eqeqeq`, `no-param-reassign`,
  `no-return-assign`, unused-vars.
- Releases via `auto shipit` — don't edit `CHANGELOG.md` or bump `package.json` version.
