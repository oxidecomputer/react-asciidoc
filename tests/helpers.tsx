import asciidoctor from '@asciidoctor/core'
import { decodeHTML } from 'entities'
import * as React from 'react'
import { renderToString } from 'react-dom/server'

import { Asciidoc, Content, prepareDocument } from '../src/asciidoc'
import { renderInlineAsString } from '../src/asciidoc/inline'
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
                __html: `<a href="#_footnoteref_${f.index}">${f.index}</a>. ${renderInlineAsString(f.textInlines)}`,
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

// Decode HTML character references (numeric + all named) so the comparison
// reflects text/structure parity rather than entity-encoding form: stock
// asciidoctor emits numeric entities (and source-preserved named ones like
// `&Omega;`), while the React render tree emits the literal characters.
// Applied to both sides. `&lt;`/`&gt;`/`&amp;` are protected from decoding —
// both renderers escape `<`/`>`/`&` identically, so leaving them as entities
// keeps a real escaped-`<` vs real-element difference detectable. (`&quot;`
// IS decoded: React escapes `"` in text but asciidoctor leaves a literal `"`.)
const SENT_LT = String.fromCharCode(1)
const SENT_GT = String.fromCharCode(2)
const SENT_AMP = String.fromCharCode(3)
const decodeEntities = (html: string): string => {
  // Protect escaped `<`/`>`/`&`. Asciidoctor's email/URL macros sometimes emit
  // a SEMICOLON-LESS `&lt`/`&gt` (invalid HTML that browsers still render as
  // the char) where the bracket abuts the macro; our renderer emits the
  // well-formed `&lt;`/`&gt;`. Both mean an escaped char, so treat the
  // malformed form (when not the prefix of a longer named entity) the same.
  const protectedHtml = html
    .replace(/&lt;|&lt(?![a-zA-Z])/g, SENT_LT)
    .replace(/&gt;|&gt(?![a-zA-Z])/g, SENT_GT)
    .split('&amp;')
    .join(SENT_AMP)
  return decodeHTML(protectedHtml)
    .split(SENT_LT)
    .join('&lt;')
    .split(SENT_GT)
    .join('&gt;')
    .split(SENT_AMP)
    .join('&amp;')
}

// Sort the attributes within each start tag. React (renderToString) emits
// attributes in JSX-prop order, which differs from asciidoctor's order; a
// stable sort on both sides makes the comparison attribute-order-insensitive.
// Tag/attr-value text in our output never contains a raw `>` (escaped to
// `&gt;`), so the coarse tag match is safe.
const sortAttributes = (html: string): string =>
  html.replace(
    /<([a-zA-Z][\w-]*)((?:\s+[a-zA-Z_:][\w:.-]*(?:="[^"]*")?)+)(\s*\/?)>/g,
    (_m, tag, attrs, tail) => {
      const tokens = attrs.match(/[a-zA-Z_:][\w:.-]*(?:="[^"]*")?/g) || []
      tokens.sort()
      return `<${tag} ${tokens.join(' ')}${tail.trim() ? ' /' : ''}>`
    },
  )

// Normalise insignificant differences between the two renderers. Whitespace
// inside <pre>/<code>/<script>/<style> is preserved by stashing those
// regions out before the > <> < collapse. React's serialisation quirks
// (camelCase HTML attrs, boolean attrs as `attr=""`, void-element self
// closing, auto-injected preload links, CSS style canonicalisation) are
// patched up so the comparison reflects structural parity rather than
// React-vs-asciidoctor formatting differences.
export const normalise = (html: string): string => {
  // React (renderToString) inserts empty `<!-- -->` comment markers between
  // adjacent text/element siblings. Strip them FIRST — before stashing
  // <pre>/<code>, otherwise markers inside those regions survive the later
  // comment removal. Asciidoctor never emits HTML comments here.
  const stash: string[] = []
  let s = html
    .replace(/<!---->|<!-- -->/g, '')
    // Stash <pre>/<code>/… verbatim. Use ASCII-only whitespace for the
    // surrounding match + trim — `\s` would swallow an adjacent typographic
    // space (e.g. the `&#8201;` thin space before an em-dash that the React
    // tree emits as a literal U+2009 right after `</code>`).
    .replace(/[ \t\r\n]*<(pre|code|script|style)\b[\s\S]*?<\/\1>[ \t\r\n]*/g, (m) => {
      stash.push(m.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, ''))
      return '@@S' + (stash.length - 1) + '@@'
    })
  s = s
    .replace(/<link\s+rel="preload"[^>]*\/?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?tbody>/g, '')
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
    // Collapse only ASCII whitespace — NOT typographic spaces (`&#160;`,
    // `&#8201;`). Stock keeps those as entities until the final decode; the
    // React tree emits them as literal chars. Treating U+00A0/U+2009 as
    // collapsible `\s` would drop them on the React side only.
    .replace(/[ \t\r\n]+/g, ' ')
    .replace(/>[ \t\r\n]+/g, '>')
    .replace(/[ \t\r\n]+</g, '<')
    .replace(/>[ \t\r\n]*@@S(\d+)@@[ \t\r\n]*</g, '>@@S$1@@<')
    .replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '')
  return decodeEntities(
    sortAttributes(s.replace(/@@S(\d+)@@/g, (_, i) => stash[Number(i)])),
  )
}
