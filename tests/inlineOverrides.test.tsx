import asciidoctor from '@asciidoctor/core'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { Asciidoc, prepareDocument } from '../src/asciidoc'
import type { InlineOverrides } from '../src/asciidoc/RenderInline'
import type { DocumentBlock } from '../src/asciidoc/utils/prepareDocument'

void React

const ad = asciidoctor()

// Rewrite every link/xref into a marked client-side router link so we can tell,
// purely from the output, whether the `anchor` inline override actually ran for
// a given anchor — including ones that live inside table cells.
const RouterLink: InlineOverrides['anchor'] = ({ node, children }) => (
  <a href={`/rewritten?${node.target}`} data-router-link>
    {children}
  </a>
)

const render = (source: string, inlineOverrides: InlineOverrides): string => {
  const doc = ad.load(source, { standalone: true })
  const prepared = prepareDocument(doc) as DocumentBlock
  return renderToString(<Asciidoc document={prepared} options={{ inlineOverrides }} />)
}

describe('inlineOverrides inside table cells', () => {
  test('anchor override runs for a link in a body cell', () => {
    const source = `[cols="30h,70"]
|===
|Hardware Root Of Trust (ROT)
|A component. See
https://rfd.shared.oxide.computer/rfd/0007[RFD 7 Hardware Root of Trust Silicon].
|===`
    const html = render(source, { anchor: RouterLink })
    // The override ran: rewritten href + marker attribute are present.
    expect(html).toContain('data-router-link')
    expect(html).toContain('href="/rewritten?https://rfd.shared.oxide.computer/rfd/0007"')
    // The stock serialized anchor must NOT survive.
    expect(html).not.toContain('href="https://rfd.shared.oxide.computer/rfd/0007"')
  })

  test('anchor override runs for a link in a header cell', () => {
    const source = `[%header,cols="2"]
|===
|See https://example.com/docs[the docs] |Notes
|body |body
|===`
    const html = render(source, { anchor: RouterLink })
    expect(html).toContain('href="/rewritten?https://example.com/docs"')
    expect(html).not.toContain('href="https://example.com/docs"')
  })

  test('anchor override runs for a link in a footer cell', () => {
    const source = `[%footer,cols="2"]
|===
|head |head
|body |body
|See https://example.com/footer[footer link] |end
|===`
    const html = render(source, { anchor: RouterLink })
    expect(html).toContain('href="/rewritten?https://example.com/footer"')
    expect(html).not.toContain('href="https://example.com/footer"')
  })

  test('anchor override runs across multiple paragraphs in one cell', () => {
    const source = `|===
|First para with https://example.com/a[link a].

Second para with https://example.com/b[link b].
|===`
    const html = render(source, { anchor: RouterLink })
    // Both links rewritten, and the two-paragraph structure is preserved.
    expect(html).toContain('href="/rewritten?https://example.com/a"')
    expect(html).toContain('href="/rewritten?https://example.com/b"')
    expect((html.match(/<p class="tableblock">/g) || []).length).toBe(2)
  })

  test('without overrides, plain links render with their stock href', () => {
    const source = `|===
|See https://example.com/x[x].
|===`
    const html = render(source, {})
    // No override registered → the link keeps its original href, no rewrite.
    expect(html).toContain('href="https://example.com/x"')
    expect(html).not.toContain('data-router-link')
  })
})

describe('inlineOverrides in blocks that used to ignore them', () => {
  // Verse / Example / Open previously rendered inline content *only* through
  // the string path, so inlineOverrides were silently dropped. They now render
  // as React by default.
  test('verse block', () => {
    const source = `[verse]\n--\nSee https://example.com/v[v].\n--`
    const html = render(source, { anchor: RouterLink })
    expect(html).toContain('href="/rewritten?https://example.com/v"')
  })

  test('open block', () => {
    const source = `--\nSee https://example.com/o[o].\n--`
    const html = render(source, { anchor: RouterLink })
    expect(html).toContain('href="/rewritten?https://example.com/o"')
  })

  test('example block', () => {
    const source = `====\nSee https://example.com/e[e].\n====`
    const html = render(source, { anchor: RouterLink })
    expect(html).toContain('href="/rewritten?https://example.com/e"')
  })

  test('paragraph', () => {
    const source = `See https://example.com/p[p].`
    const html = render(source, { anchor: RouterLink })
    expect(html).toContain('href="/rewritten?https://example.com/p"')
  })
})

describe('straddling passthrough HTML falls back to the string path', () => {
  // `pass:q[<u>… *…*</u>]` runs quote subs but not specialchars, so the raw
  // `<u>` opens in one inline node and `</u>` closes in another with a
  // `<strong>` between. React can't reconstruct that node-by-node, so without
  // overrides the template must fall back to the serialized string path and
  // keep the verbatim HTML intact.
  test('verbatim <u> survives when no overrides are registered', () => {
    const source = `The text pass:q[<u>underline *me*</u>] is bold.`
    const html = render(source, {})
    expect(html).toContain('<u>underline <strong>me</strong></u>')
    expect(html).not.toContain('&lt;u&gt;')
  })

  // Registering an inline override used to force the whole document onto the
  // React path, corrupting straddling passthrough into visible `&lt;u&gt;`.
  // The string-path fallback must win regardless: showing the HTML correctly
  // beats applying an override (here a cosmetic `quoted` wrapper) to a run that
  // can't be rebuilt node-by-node anyway.
  test('verbatim <u> survives when overrides are registered', () => {
    const Quoted: InlineOverrides['quoted'] = ({ children }) => <span>{children}</span>
    const source = `The text pass:q[<u>underline *me*</u>] is bold.`
    const html = render(source, { quoted: Quoted })
    expect(html).toContain('<u>underline <strong>me</strong></u>')
    expect(html).not.toContain('&lt;u&gt;')
  })
})
