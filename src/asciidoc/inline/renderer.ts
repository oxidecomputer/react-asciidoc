import { decodeHTML } from 'entities'

import { InlineNode } from './types'

const QUOTE_TAGS: Record<string, [string, string, boolean?]> = {
  monospaced: ['<code>', '</code>', true],
  emphasis: ['<em>', '</em>', true],
  strong: ['<strong>', '</strong>', true],
  double: ['&#8220;', '&#8221;'],
  single: ['&#8216;', '&#8217;'],
  mark: ['<mark>', '</mark>', true],
  superscript: ['<sup>', '</sup>', true],
  subscript: ['<sub>', '</sub>', true],
  asciimath: ['\\$', '\\$'],
  latexmath: ['\\(', '\\)'],
}

// Entity-aware attribute escaping: strings coming in may already contain
// HTML entity references (from specialcharacters or replacements subs).
// We must not double-escape `&` when it starts a valid entity.
const VALID_ENTITY_TAIL = /^(?:[a-zA-Z][a-zA-Z]+\d{0,2}|#\d{1,7}|#x[\da-fA-F]{1,6});/

function encodeImageSrc(target: string): string {
  // Encode spaces (and only spaces) for image src; matches asciidoctor behavior.
  return target.replace(/ /g, '%20')
}

function escapeAttr(str: string): string {
  let out = ''
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === '&') {
      if (VALID_ENTITY_TAIL.test(str.slice(i + 1))) {
        out += '&'
      } else {
        out += '&amp;'
      }
    } else if (ch === '"') {
      out += '&quot;'
    } else if (ch === '<') {
      out += '&lt;'
    } else if (ch === '>') {
      out += '&gt;'
    } else {
      out += ch
    }
  }
  return out
}

export function renderInline(nodes: InlineNode[], iconsFont = false): string {
  return nodes.map((n) => renderNode(n, iconsFont)).join('')
}

function renderNode(node: InlineNode, iconsFont: boolean): string {
  switch (node.type) {
    case 'text':
      return node.text

    case 'quoted': {
      const tags = QUOTE_TAGS[node.subtype] || ['', '']
      const hasTag = tags[2] === true
      const text = renderInline(node.text, iconsFont)

      let attrs = ''
      if (node.id) attrs += ` id="${node.id}"`
      if (node.role) attrs += ` class="${escapeAttr(node.role)}"`

      // `mark` with role/id is rendered as <span> in asciidoctor html5
      if (node.subtype === 'mark' && (node.id || node.role)) {
        return `<span${attrs}>${text}</span>`
      }

      if (hasTag) {
        let open = tags[0]
        if (attrs && open.endsWith('>')) {
          open = open.slice(0, -1) + attrs + '>'
        }
        return `${open}${text}${tags[1]}`
      }

      if (node.id || node.role) {
        return `<span${attrs}>${tags[0]}${text}${tags[1]}</span>`
      }

      return `${tags[0]}${text}${tags[1]}`
    }

    case 'anchor': {
      const id = node.id || ''
      const role = node.role || ''
      let idAttr = id ? ` id="${id}"` : ''
      let classAttr = role ? ` class="${escapeAttr(role)}"` : ''
      if (id) idAttr += classAttr
      else idAttr = classAttr
      const text = renderInline(node.text, iconsFont)
      switch (node.subtype) {
        case 'link': {
          const target = escapeAttr(node.target)
          let windowAttrs = ''
          if (node.window) {
            windowAttrs = ` target="${escapeAttr(node.window)}"`
            if (node.window === '_blank') {
              windowAttrs += ` rel="noopener"`
            }
          }
          return `<a href="${target}"${idAttr}${windowAttrs}>${text}</a>`
        }
        case 'ref': {
          return `<a id="${escapeAttr(node.id || node.target)}"></a>`
        }
        case 'xref': {
          // Asciidoctor xref target rules:
          //  - already includes `#` (path#id form) → use verbatim
          //  - contains `/` → looks like a path → use verbatim
          //  - otherwise (any other chars allowed, including spaces) → `#id` form
          const t = node.target
          const target =
            t.startsWith('#') || t.includes('#') || t.includes('/')
              ? escapeAttr(t)
              : '#' + escapeAttr(t)
          return `<a href="${target}"${idAttr}>${text}</a>`
        }
        case 'bibref': {
          return `[<a id="${escapeAttr(node.id || node.target)}"></a>]`
        }
      }
    }

    case 'image': {
      const target = escapeAttr(encodeImageSrc(node.target))
      const alt = node.alt || ''
      let widthHeight = ''
      if (node.width) widthHeight += ` width="${escapeAttr(node.width)}"`
      if (node.height) widthHeight += ` height="${escapeAttr(node.height)}"`
      const titleAttr = node.title ? ` title="${escapeAttr(node.title)}"` : ''
      // `link` wraps the inner markup in `<a class="image" href=…>` (matches
      // Ruby's `append_link_constraint_attrs`).
      const wrapLink = (inner: string): string => {
        if (!node.link) return inner
        let win = ''
        if (node.window) {
          win = ` target="${escapeAttr(node.window)}"`
          if (node.window === '_blank') win += ` rel="noopener"`
        }
        return `<a class="image" href="${escapeAttr(node.link)}"${win}>${inner}</a>`
      }
      if (node.subtype === 'icon') {
        const iconType = node.iconType || 'text'
        const classes = ['icon']
        if (node.role) classes.push(node.role)
        if (node.float) classes.push(node.float)
        const classAttr = ` class="${classes.join(' ')}"`
        const idAttr = node.id ? ` id="${escapeAttr(node.id)}"` : ''
        if (iconType === 'text') {
          const label = node.alt || node.target
          return `<span${classAttr}${idAttr}${titleAttr}>${wrapLink(`[${label}&#93;`)}</span>`
        }
        if (iconType === 'font') {
          // Font-icon title sits on the <i>, not the wrapper span.
          return `<span${classAttr}${idAttr}>${wrapLink(`<i class="fa fa-${escapeAttr(node.target)}"${titleAttr}></i>`)}</span>`
        }
        return `<span${classAttr}${idAttr}${titleAttr}>${wrapLink(`<img src="${target}" alt="${escapeAttr(alt)}"${widthHeight}>`)}</span>`
      }
      const classes = ['image']
      if (node.role) classes.push(node.role)
      if (node.float) classes.push(node.float)
      const classAttr = ` class="${classes.join(' ')}"`
      const idAttr = node.id ? ` id="${escapeAttr(node.id)}"` : ''
      // Image title goes on the <img> element, not the <span>.
      return `<span${classAttr}${idAttr}>${wrapLink(`<img src="${target}" alt="${escapeAttr(alt)}"${widthHeight}${titleAttr}>`)}</span>`
    }

    case 'footnote': {
      // Reference-only form (footnoteref:id[] or footnote:id[] with prior def)
      if (node.refid && (!node.text || node.text.length === 0)) {
        if (node.index !== undefined) {
          return `<sup class="footnoteref">[<a class="footnote" href="#_footnotedef_${node.index}" title="View footnote.">${node.index}</a>]</sup>`
        }
        return `<sup class="footnoteref red" title="Unresolved footnote reference.">[${escapeAttr(node.refid)}]</sup>`
      }
      const idx = node.index
      if (idx === undefined) {
        const id = node.id ? ` id="${escapeAttr(node.id)}"` : ''
        const text = renderInline(node.text, iconsFont)
        return `<sup${id}>[${text}]</sup>`
      }
      const idAttr = node.id ? ` id="_footnote_${escapeAttr(node.id)}"` : ''
      return `<sup class="footnote"${idAttr}>[<a id="_footnoteref_${idx}" class="footnote" href="#_footnotedef_${idx}" title="View footnote.">${idx}</a>]</sup>`
    }

    case 'indexterm':
      return node.visible
        ? renderInline([{ type: 'text', text: node.terms.join(', ') }], iconsFont)
        : ''

    case 'callout':
      // Without icons=font, asciidoctor html5 emits <b class="conum">(N)</b>.
      // The icons=font path emits the <i> form; we don't track that flag here.
      return `<b class="conum">(${node.number})</b>`

    case 'break':
      return '<br>\n'

    case 'button':
      return `<b class="button">${renderInline(node.text, iconsFont)}</b>`

    case 'kbd': {
      if (node.keys.length === 1) {
        return `<kbd>${node.keys[0]}</kbd>`
      }
      return `<span class="keyseq">${node.keys.map((k) => `<kbd>${k}</kbd>`).join('+')}</span>`
    }

    case 'menu': {
      if (node.items.length === 1) {
        return `<b class="menuref">${node.items[0]}</b>`
      }
      // Format matches asciidoctor html5:
      //   <span class="menuseq"><b class="menu">First</b>
      //   &#160;<b class="caret">&#8250;</b> <b class="submenu">Mid</b>
      //   ...
      //   &#160;<b class="caret">&#8250;</b> <b class="menuitem">Last</b></span>
      const SEPARATOR = iconsFont
        ? '&#160;<i class="fa fa-angle-right caret"></i> '
        : '&#160;<b class="caret">&#8250;</b> '
      const parts: string[] = []
      for (let i = 0; i < node.items.length; i++) {
        const item = node.items[i]
        if (i === 0) {
          parts.push(`<b class="menu">${item}</b>`)
        } else if (i < node.items.length - 1) {
          parts.push(`${SEPARATOR}<b class="submenu">${item}</b>`)
        } else {
          parts.push(`${SEPARATOR}<b class="menuitem">${item}</b>`)
        }
      }
      return `<span class="menuseq">${parts.join('')}</span>`
    }
  }
}

export function renderInlineAsString(nodes: InlineNode[], iconsFont = false): string {
  return renderInline(nodes, iconsFont)
}

/**
 * Render an inline AST back to PLAIN TEXT — the substituted source with no HTML
 * markup. This is the verbatim-source counterpart to `renderInlineAsString`: it
 * resolves text-level subs (notably `attributes`) but emits the bare code a
 * syntax highlighter should tokenize rather than HTML5 elements.
 *
 *  - `text` nodes: emitted as-is, with `specialcharacters` entities decoded back
 *    to literal `< > &` when `decodeEntities` is set (verbatim blocks include
 *    `specialcharacters` by default, so normally `true`). `raw` passthrough
 *    nodes (`pass:[]` / `+++`) are already-final author HTML — emitted verbatim,
 *    never decoded.
 *  - `quoted` / `anchor` / `footnote` / `button`: flattened to their inner text.
 *    A highlighter wants the code, not `<em>` / `<a>`; these only appear when the
 *    author opted into `+quotes` / `+macros` on the block.
 *  - `callout`: preserved raw as `<N>` — the highlighter resolves callouts itself.
 *  - `break`: a newline.
 *  - `image` / `kbd` / `menu` / `indexterm`: no meaningful verbatim text — skipped.
 */
export function renderInlineAsText(nodes: InlineNode[], decodeEntities = true): string {
  let out = ''
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        out += node.raw ? node.text : decodeEntities ? decodeHTML(node.text) : node.text
        break
      case 'quoted':
      case 'anchor':
      case 'footnote':
      case 'button':
        out += renderInlineAsText(node.text, decodeEntities)
        break
      case 'callout':
        out += `<${node.number}>`
        break
      case 'break':
        out += '\n'
        break
      // image / kbd / menu / indexterm: no meaningful verbatim text — skip.
      default:
        break
    }
  }
  return out
}
