import asciidoctor from '@asciidoctor/core'
import * as React from 'react'
import { renderToString } from 'react-dom/server'

import { Asciidoc, Content, prepareDocument } from '../src/asciidoc'
import Outline from '../src/asciidoc/templates/Outline'
import type { DocumentBlock } from '../src/asciidoc/utils/prepareDocument'

// tsx's standalone runtime expects classic JSX (calls React.createElement);
// vitest uses the automatic runtime via @vitejs/plugin-react. The import
// above keeps `React` in scope so both work.
void React

const ad = asciidoctor()

export const DEFAULT_ATTRS = {
  sectlinks: 'true',
  icons: 'font',
  stem: 'latexmath',
  stylesheet: false,
}

// Stock asciidoctor output in embedded (non-standalone) mode — this is the
// per-block HTML that our React templates aim to mirror.
export const stockHtml = (
  source: string,
  attrs: Record<string, unknown> = DEFAULT_ATTRS,
): string => ad.convert(source, { attributes: attrs, standalone: false }) as string

// In embedded mode asciidoctor still emits the document title (when
// `:showtitle:` is set), the TOC at the top of the body, and a footnotes
// block at the bottom. We mirror that here so tests can render the React
// tree through the full <Asciidoc> wrapper (which gives templates access
// to document.attributes via Context) without the header / footer chrome
// that standalone mode adds.
const BodyOnly = ({ document }: { document: DocumentBlock }) => {
  const a = document.attributes
  const showToc =
    a['toc'] !== undefined &&
    (a['toc-placement'] === undefined ||
      a['toc-placement'] === 'auto' ||
      a['toc-placement'] === '')
  const hasFootnotes =
    document.footnotes && document.footnotes.length > 0 && a['nofootnotes'] === undefined
  const showTitle = a['showtitle'] !== undefined && document.hasHeader && document.title
  return (
    <>
      {showTitle && (
        <h1
          id={document.id || undefined}
          dangerouslySetInnerHTML={{ __html: document.title }}
        />
      )}
      {showToc && document.sections && document.sections.length > 0 && (
        <div id="toc" className="toc">
          <div id="toctitle">{a['toc-title'] || 'Table of Contents'}</div>
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

export const reactHtml = (
  source: string,
  attrs: Record<string, unknown> = DEFAULT_ATTRS,
): string => {
  const doc = ad.load(source, { attributes: attrs, standalone: true })
  const prepared = prepareDocument(doc) as DocumentBlock
  return renderToString(
    <Asciidoc document={prepared} options={{ customDocument: BodyOnly }} />,
  )
}

const VOID_TAGS = 'area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr'

// Normalise insignificant differences between the two renderers. Whitespace
// inside <pre>/<code>/<script>/<style> is preserved by stashing those
// regions out before the > <> < collapse. React's serialisation quirks
// (camelCase HTML attrs, boolean attrs as `attr=""`, void-element self
// closing, auto-injected preload links, CSS style canonicalisation) are
// patched up so the comparison reflects structural parity rather than
// React-vs-asciidoctor formatting differences.
export const normalise = (html: string): string => {
  const stash: string[] = []
  let s = html.replace(/\s*<(pre|code|script|style)\b[\s\S]*?<\/\1>\s*/g, (m) => {
    stash.push(m.replace(/^\s+|\s+$/g, ''))
    return '@@S' + (stash.length - 1) + '@@'
  })
  s = s
    .replace(/<link\s+rel="preload"[^>]*\/?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\bcolSpan=/g, 'colspan=')
    .replace(/\browSpan=/g, 'rowspan=')
    .replace(new RegExp('<(' + VOID_TAGS + ')([^>]*?)/>', 'g'), '<$1$2>')
    .replace(
      /(\b(?:reversed|disabled|checked|selected|readonly|multiple|autofocus|autoplay|controls|loop|muted|defer|async|hidden|open|required))=""/g,
      '$1',
    )
    .replace(/style="([^"]*)"/g, (_m, body) => {
      const decls = body
        .split(';')
        .map((d: string) => d.trim())
        .filter(Boolean)
        .map((d: string) => d.replace(/\s*:\s*/, ':'))
      return 'style="' + decls.join(';') + '"'
    })
    .replace(/[ \t\r\n]+/g, ' ')
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<')
    .replace(/>\s*@@S(\d+)@@\s*</g, '>@@S$1@@<')
    .replace(/^\s+|\s+$/g, '')
  return s.replace(/@@S(\d+)@@/g, (_, i) => stash[Number(i)])
}
