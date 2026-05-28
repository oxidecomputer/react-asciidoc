import asciidoctor from '@asciidoctor/core'
import { renderToString } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { Asciidoc, Content, prepareDocument } from '../src/asciidoc'
import Outline from '../src/asciidoc/templates/Outline'
import type { DocumentBlock } from '../src/asciidoc/utils/prepareDocument'
import * as examples from '../src/examples'

const ad = asciidoctor()

const attrs = {
  sectlinks: 'true',
  icons: 'font',
  stem: 'latexmath',
  stylesheet: false,
}

// Stock asciidoctor output in embedded (non-standalone) mode — this is the
// per-block HTML that our React templates aim to mirror.
const stockHtml = (source: string): string =>
  ad.convert(source, { attributes: attrs, standalone: false }) as string

// Body-only custom Document, so we can use the full <Asciidoc> Context
// (templates depend on document.attributes for things like `sectlinks`)
// without emitting the header/footer chrome that embedded asciidoctor
// omits. In embedded mode asciidoctor still emits the TOC at the top of
// the body, so we mirror that here.
const BodyOnly = ({ document }: { document: DocumentBlock }) => {
  const attrs = document.attributes
  const showToc =
    attrs['toc'] !== undefined &&
    (attrs['toc-placement'] === undefined ||
      attrs['toc-placement'] === 'auto' ||
      attrs['toc-placement'] === '')
  const hasFootnotes =
    document.footnotes &&
    document.footnotes.length > 0 &&
    attrs['nofootnotes'] === undefined
  const showTitle = attrs['showtitle'] !== undefined && document.title
  return (
    <>
      {showTitle && (
        <h1 dangerouslySetInnerHTML={{ __html: document.title }} />
      )}
      {showToc && document.sections && document.sections.length > 0 && (
        <div id="toc" className="toc">
          <div id="toctitle">{attrs['toc-title'] || 'Table of Contents'}</div>
          <Outline sections={document.sections} />
        </div>
      )}
      <Content blocks={document.blocks} />
      {hasFootnotes && (
        <div id="footnotes">
          <hr />
          {document.footnotes.map((f) => (
            <div
              className="footnote"
              id={`_footnotedef_${f.index}`}
              key={f.index}
              dangerouslySetInnerHTML={{
                __html: `<a href="#_footnoteref_${f.index}">${f.index}</a>. ${f.text || ''}`,
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}

const reactHtml = (source: string): string => {
  const doc = ad.load(source, { attributes: attrs, standalone: true })
  const prepared = prepareDocument(doc) as DocumentBlock
  return renderToString(
    <Asciidoc document={prepared} options={{ customDocument: BodyOnly }} />,
  )
}

const VOID_TAGS = 'area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr'

// Normalise insignificant whitespace before comparison. Stock asciidoctor
// pretty-prints block-level tags with newlines; React's renderToString
// emits them inline. Whitespace inside <pre>/<code>/<script>/<style> is
// preserved by stashing those regions out; surrounding whitespace is
// consumed so adjacent tags can be tightened by the > <> < collapse.
const normalise = (html: string): string => {
  const stash: string[] = []
  let s = html.replace(
    /\s*<(pre|code|script|style)\b[\s\S]*?<\/\1>\s*/g,
    (m) => {
      stash.push(m.replace(/^\s+|\s+$/g, ''))
      return '@@S' + (stash.length - 1) + '@@'
    },
  )
  s = s
    // React 19 hoists `<link rel="preload" as="image">` for every `<img>`
    // it renders server-side; strip those so they don't show up in the diff.
    .replace(/<link\s+rel="preload"[^>]*\/?>/g, '')
    // Strip HTML comments — informational only.
    .replace(/<!--[\s\S]*?-->/g, '')
    // React preserves camelCase for some HTML attrs (colSpan/rowSpan).
    .replace(/\bcolSpan=/g, 'colspan=')
    .replace(/\browSpan=/g, 'rowspan=')
    .replace(new RegExp('<(' + VOID_TAGS + ')([^>]*?)/>', 'g'), '<$1$2>')
    // React renders boolean HTML attributes as `attr=""`; stock asciidoctor
    // emits them bare.
    .replace(/(\b(?:reversed|disabled|checked|selected|readonly|multiple|autofocus|autoplay|controls|loop|muted|defer|async|hidden|open|required))=""/g, '$1')
    // Canonicalise inline styles: strip spaces after colons and ensure a
    // single trailing semicolon. React serialises CSSOM-style; stock
    // asciidoctor pretty-prints with spaces and a trailing `;`.
    .replace(/style="([^"]*)"/g, (_m, body) => {
      const decls = body
        .split(';')
        .map((d: string) => d.trim())
        .filter(Boolean)
        .map((d: string) => d.replace(/\s*:\s*/, ':'))
      return 'style="' + decls.join(';') + '"'
    })
    // Collapse all whitespace runs to a single space.
    .replace(/[ \t\r\n]+/g, ' ')
    // Tighten tag boundaries.
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<')
    .replace(/>\s*@@S(\d+)@@\s*</g, '>@@S$1@@<')
    .replace(/^\s+|\s+$/g, '')
  return s.replace(/@@S(\d+)@@/g, (_, i) => stash[Number(i)])
}

const SOURCES: Array<[string, string]> = []
for (const [name, value] of Object.entries(examples)) {
  if (Array.isArray(value)) {
    value.forEach((snippet, i) => SOURCES.push([name + '[' + i + ']', snippet as string]))
  } else if (typeof value === 'string') {
    SOURCES.push([name, value])
  }
}

describe('renderer parity', () => {
  for (const [name, source] of SOURCES) {
    test(name, () => {
      const stock = normalise(stockHtml(source))
      const react = normalise(reactHtml(source))
      expect(react).toBe(stock)
    })
  }
})
