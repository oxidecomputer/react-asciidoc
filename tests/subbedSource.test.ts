import asciidoctor from '@asciidoctor/core'
import { describe, expect, test } from 'vitest'

import { prepareDocument } from '../src/asciidoc'
import type { Block, LiteralBlock } from '../src/asciidoc/utils/prepareDocument'

// `subbedSource` exposes the substituted, un-escaped plain-text source of a
// verbatim block — `{attr}` refs resolved, callouts left raw — so a downstream
// highlighter can tokenize the resolved code instead of re-deriving subs from
// raw `source`. Verify the substitution semantics the package now owns.

const ad = asciidoctor()

const listings = (source: string): LiteralBlock[] => {
  const doc = prepareDocument(ad.load(source, { standalone: true }))
  const out: LiteralBlock[] = []
  const walk = (blocks: Block[]) => {
    for (const b of blocks) {
      if (b.type === 'listing' || b.type === 'literal') out.push(b as LiteralBlock)
      if (b.blocks) walk(b.blocks)
    }
  }
  walk(doc.blocks)
  return out
}

const only = (source: string): LiteralBlock => {
  const found = listings(source)
  expect(found).toHaveLength(1)
  return found[0]
}

describe('subbedSource', () => {
  test('resolves attribute refs (subs="+attributes") while raw source stays raw', () => {
    const block = only(`:api-version: 2026032500.0.0

[source,text,subs="+attributes"]
----
api-version: {api-version}
----`)
    expect(block.source).toBe('api-version: {api-version}')
    expect(block.subbedSource).toBe('api-version: 2026032500.0.0')
  })

  test('subs="normal" resolves attributes too (resolved-list gating, not substring)', () => {
    const block = only(`:api-version: 2026032500.0.0

[source,text,subs="normal"]
----
api-version: {api-version}
----`)
    expect(block.subbedSource).toBe('api-version: 2026032500.0.0')
  })

  test('without +attributes, subbedSource equals raw source (braces stay literal)', () => {
    const block = only(`:api-version: 2026032500.0.0

[source,text]
----
api-version: {api-version}
----`)
    expect(block.source).toBe('api-version: {api-version}')
    expect(block.subbedSource).toBe(block.source)
  })

  test('escaped attribute ref stays literal; real ref resolves', () => {
    const block = only(`:api-version: 9

[source,text,subs="+attributes"]
----
\\{escaped} and {api-version}
----`)
    expect(block.subbedSource).toBe('{escaped} and 9')
  })

  test('{counter:n} increments exactly once per block (single-pass guard)', () => {
    // The same counter appears in a section heading and two listings. Deriving
    // subbedSource from the SAME AST as `content` must not re-substitute — a
    // second pass would double-increment the shared counter. Sequential 1, 2
    // across the two listings proves each was parsed exactly once.
    const found = listings(`:n:

== Step {counter:n}

[source,text,subs="+attributes"]
----
listing {counter:n}
----

[source,text,subs="+attributes"]
----
next {counter:n}
----`)
    expect(found).toHaveLength(2)
    expect(found[0].subbedSource).toBe('listing 1')
    expect(found[1].subbedSource).toBe('next 2')
    // content (HTML) and subbedSource derive from one parse — same counter value.
    expect(found[0].content).toBe('listing 1')
    expect(found[1].content).toBe('next 2')
  })

  test('callout markers survive raw as <N> (subs="+attributes" path)', () => {
    const block = only(`[source,ruby,subs="+attributes"]
----
puts "hi" # <1>
----
<1> prints`)
    expect(block.subbedSource).toBe('puts "hi" # <1>')
    // The HTML `content` escapes the marker; subbedSource keeps it raw.
    expect(block.content).toContain('&lt;1&gt;')
  })

  test('callout markers survive raw as <N> (default subs path)', () => {
    const block = only(`[source,ruby]
----
puts "hi" # <1>
----
<1> prints`)
    expect(block.subbedSource).toBe('puts "hi" # <1>')
  })
})
