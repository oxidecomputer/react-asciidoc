import asciidoctor from '@asciidoctor/core'
import { describe, expect, test } from 'vitest'

import { findSection, plainText, prepareDocument } from '../src/asciidoc'
import type { InlineNode } from '../src/asciidoc/inline'
import { parseInline } from '../src/asciidoc/inline'

const ad = asciidoctor()

const pt = (src: string): string =>
  plainText(
    parseInline(src, { attributes: {}, state: { footnoteIndex: 0 } }) as InlineNode[],
  )

describe('plainText', () => {
  test('strips formatting, keeps inner text', () => {
    expect(pt('Hello *bold* and _italic_ text')).toBe('Hello bold and italic text')
  })

  test('decodes numeric entities the parser leaves in text nodes', () => {
    // Apostrophe → `&#8217;` via replacements, decoded back to the character.
    expect(pt("it's here")).toBe('it’s here')
  })

  test('keeps smart-quote delimiters, drops presentational delimiters', () => {
    expect(pt('"`quoted`"')).toBe('“quoted”')
    expect(pt('H~2~O e^x^')).toBe('H2O ex')
  })

  test('projects links to their label text', () => {
    expect(pt('see https://example.com[the docs] now')).toBe('see the docs now')
  })

  test('strips tags from raw passthrough', () => {
    expect(pt('a +++<u>b</u>+++ c')).toBe('a b c')
  })

  test('keyboard macro', () => {
    const nodes = parseInline('press kbd:[Ctrl+C]', {
      attributes: { experimental: '' },
      state: { footnoteIndex: 0 },
    }) as InlineNode[]
    expect(plainText(nodes)).toBe('press Ctrl+C')
  })

  test('empty / undefined input', () => {
    expect(plainText(undefined)).toBe('')
    expect(plainText([])).toBe('')
  })
})

describe('findSection', () => {
  const doc = prepareDocument(
    ad.load(
      `= Title

[#intro]
== Introduction

Some text.

[#nested]
=== Nested

* item one
* [#listitem]
+
paragraph in item

|===
| [#cellanchor] cell
|===
`,
      { sourcemap: true },
    ),
  )

  test('finds a top-level section by id', () => {
    expect(findSection(doc.blocks, 'intro')?.type).toBe('section')
  })

  test('finds a nested section', () => {
    expect(findSection(doc.blocks, 'nested')?.type).toBe('section')
  })

  test('returns undefined for an unknown id', () => {
    expect(findSection(doc.blocks, 'nope')).toBeUndefined()
  })
})
