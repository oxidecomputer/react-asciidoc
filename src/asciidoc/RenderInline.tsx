import { decodeHTML } from 'entities'
import parse from 'html-react-parser'
import { type ComponentType, Fragment, type ReactNode, useContext } from 'react'

import { Context } from './'
import { renderInlineAsString } from './inline'
import type {
  AnchorNode,
  ButtonNode,
  CalloutNode,
  FootnoteNode,
  ImageNode,
  IndexTermNode,
  InlineNode,
  KeyboardNode,
  MenuNode,
  QuotedNode,
} from './inline'

/**
 * Render an inline AST to an HTML string suitable for
 * `dangerouslySetInnerHTML`. Retained for consumers and tooling that still
 * want the serialised form; the React templates render via `<RenderInline>`.
 */
export const inlineHtml = (
  nodes: InlineNode[] | undefined,
  iconsFont = false,
): { __html: string } => ({
  __html: nodes ? renderInlineAsString(nodes, iconsFont) : '',
})

/**
 * True when the inline AST carries verbatim passthrough HTML that can't be
 * faithfully rebuilt as a React tree, so the template must fall back to the
 * `dangerouslySetInnerHTML` string path. Two forms:
 *
 *  - `raw` text nodes (`+++…+++`, `pass:[…]`) — explicit no-subs passthroughs.
 *  - text nodes holding a bare `<`/`>`. The substitution pipeline escapes every
 *    real `<`/`>` to `&lt;`/`&gt;` *before* quotes/macros run, so a bare angle
 *    bracket surviving into a text node can only be passthrough HTML where
 *    specialchars was skipped — e.g. `pass:q[<u>x *y*</u>]`, which parses to
 *    text `<u>x `, a `<strong>y</strong>`, then text `</u>`. Such HTML may
 *    *straddle* sibling nodes (open tag in one, close in another), and React
 *    renders node-by-node — `parse('<u>x ')` auto-closes the tag — so only
 *    re-serialising the whole sequence to one string preserves it.
 *
 * Registered inline overrides still force the React path (overrides win; the
 * straddling-passthrough-plus-override combination is vanishingly rare).
 * Recurses into the `text` children of quoted/anchor/footnote/button nodes. */
export const hasRawInline = (nodes: InlineNode[] | undefined): boolean => {
  if (!nodes) return false
  for (const node of nodes) {
    if (node.type === 'text') {
      if (node.raw || /[<>]/.test(node.text)) return true
    } else if ('text' in node && Array.isArray(node.text) && hasRawInline(node.text)) {
      return true
    }
  }
  return false
}

/**
 * Decide how a template should render an inline AST. This is a React renderer,
 * so the default is to walk the AST as a real React tree (`<RenderInline>`),
 * which is also what lets `inlineOverrides` reach inline nodes. The only reason
 * to fall back to the `dangerouslySetInnerHTML` string path is straddling
 * passthrough HTML (see `hasRawInline`) — and only when no overrides are
 * registered, since overrides require the React path regardless. Returns
 * `iconsFont` too, for templates that need it on the string-path serialiser. */
export const useInlineRenderMode = (
  nodes: InlineNode[] | undefined,
): { react: boolean; iconsFont: boolean } => {
  const ctx = useContext(Context)
  const hasOverrides = !!ctx.inlineOverrides && Object.keys(ctx.inlineOverrides).length > 0
  return {
    react: hasOverrides || !hasRawInline(nodes),
    iconsFont: ctx.document?.attributes?.['icons'] === 'font',
  }
}

/** Decode HTML entities (numeric + all named) before handing text/attribute
 *  values to React. React re-escapes the structural characters (`<`, `>`,
 *  `&`, `"`) on output so they round-trip, while typographic characters
 *  render as the literal character — matching the entity-decoded comparison
 *  in the harness. */
const dec = (s: string | undefined): string => (s ? decodeHTML(s) : '')

/**
 * Per-subtype React overrides for inline nodes. When a consumer registers
 * an override, the matching inline subtype is rendered through that
 * component instead of the default element.
 */
export type InlineOverrides = {
  quoted?: ComponentType<{ node: QuotedNode; children: ReactNode }>
  anchor?: ComponentType<{ node: AnchorNode; children: ReactNode }>
  image?: ComponentType<{ node: ImageNode }>
  footnote?: ComponentType<{ node: FootnoteNode; children: ReactNode }>
  indexterm?: ComponentType<{ node: IndexTermNode }>
  callout?: ComponentType<{ node: CalloutNode }>
  break?: ComponentType
  button?: ComponentType<{ node: ButtonNode; children: ReactNode }>
  kbd?: ComponentType<{ node: KeyboardNode }>
  menu?: ComponentType<{ node: MenuNode }>
}

interface RenderCtx {
  overrides: InlineOverrides
  iconsFont: boolean
  // Set inside a `[bibliography]` list. The first bibref encountered is the
  // entry definition (rendered anchor-first with its label); `pending` flips
  // to false once consumed so later bibrefs render as inline citations.
  bibDef?: { pending: boolean }
}

/**
 * Render an inline AST as a real React element tree. Text and attribute values
 * are entity-decoded so React controls escaping; every node subtype maps to
 * actual elements (no `dangerouslySetInnerHTML`), and consumers can replace
 * any subtype via `options.inlineOverrides`.
 */
const RenderInline = ({
  nodes,
  bibliography = false,
}: {
  nodes: InlineNode[] | undefined
  // When true, the first bibref is rendered as a `[bibliography]` entry
  // definition (`<a id></a>[label]`) rather than an inline citation.
  bibliography?: boolean
}) => {
  const ctx = useContext(Context)
  if (!nodes || nodes.length === 0) return null
  const rctx: RenderCtx = {
    overrides: ctx.inlineOverrides || {},
    iconsFont: ctx.document?.attributes?.['icons'] === 'font',
    bibDef: bibliography ? { pending: true } : undefined,
  }
  return <>{walk(nodes, rctx)}</>
}

const walk = (nodes: InlineNode[], ctx: RenderCtx): ReactNode[] =>
  nodes.map((node, i) => <Fragment key={i}>{renderNode(node, ctx)}</Fragment>)

const renderNode = (node: InlineNode, ctx: RenderCtx): ReactNode => {
  const { overrides } = ctx
  switch (node.type) {
    case 'text':
      // Raw passthrough HTML → parse into real React elements (it must not be
      // escaped as text). Regular text → entity-decoded string child.
      return node.raw ? parse(node.text) : dec(node.text)
    case 'quoted': {
      const children = walk(node.text, ctx)
      if (overrides.quoted)
        return <overrides.quoted node={node}>{children}</overrides.quoted>
      return defaultQuoted(node, children)
    }
    case 'anchor': {
      // A bibref is an anchor *definition*, not a navigable link, so it
      // bypasses `overrides.anchor` (which targets link/xref) and renders its
      // default form directly. In a `[bibliography]` list the first bibref is
      // the entry definition (anchor-first + bracketed label, `<a id></a>[label]`);
      // later bibrefs are inline citations (`[<a id></a>]`), as is every bibref
      // outside a bibliography. This keeps the definition byte-identical to the
      // string path while real links/xrefs in the entry still reach overrides.
      if (node.subtype === 'bibref') {
        const isDef = ctx.bibDef?.pending ?? false
        if (ctx.bibDef) ctx.bibDef.pending = false
        if (isDef)
          return (
            <>
              <a id={node.id || node.target} />
              {'['}
              {walk(node.text, ctx)}
              {']'}
            </>
          )
        return defaultAnchor(node, null)
      }
      const children = walk(node.text, ctx)
      if (overrides.anchor)
        return <overrides.anchor node={node}>{children}</overrides.anchor>
      return defaultAnchor(node, children)
    }
    case 'image':
      if (overrides.image) return <overrides.image node={node} />
      return defaultImage(node)
    case 'footnote': {
      const children = walk(node.text || [], ctx)
      if (overrides.footnote)
        return <overrides.footnote node={node}>{children}</overrides.footnote>
      return defaultFootnote(node, children)
    }
    case 'indexterm':
      if (overrides.indexterm) return <overrides.indexterm node={node} />
      return node.visible ? dec(node.terms.join(', ')) : null
    case 'callout':
      if (overrides.callout) return <overrides.callout node={node} />
      return <b className="conum">{`(${node.number})`}</b>
    case 'break':
      if (overrides.break) return <overrides.break />
      return <br />
    case 'button': {
      const children = walk(node.text, ctx)
      if (overrides.button)
        return <overrides.button node={node}>{children}</overrides.button>
      return <b className="button">{children}</b>
    }
    case 'kbd':
      if (overrides.kbd) return <overrides.kbd node={node} />
      return defaultKbd(node)
    case 'menu':
      if (overrides.menu) return <overrides.menu node={node} />
      return defaultMenu(node, ctx.iconsFont)
  }
}

const defaultQuoted = (node: QuotedNode, children: ReactNode): ReactNode => {
  const className = node.role || undefined
  const id = node.id || undefined
  switch (node.subtype) {
    case 'emphasis':
      return (
        <em id={id} className={className}>
          {children}
        </em>
      )
    case 'strong':
      return (
        <strong id={id} className={className}>
          {children}
        </strong>
      )
    case 'monospaced':
      return (
        <code id={id} className={className}>
          {children}
        </code>
      )
    case 'superscript':
      return (
        <sup id={id} className={className}>
          {children}
        </sup>
      )
    case 'subscript':
      return (
        <sub id={id} className={className}>
          {children}
        </sub>
      )
    case 'mark':
      if (id || className)
        return (
          <span id={id} className={className}>
            {children}
          </span>
        )
      return <mark>{children}</mark>
    case 'double':
      return wrapNoTag(id, className, '“', children, '”')
    case 'single':
      return wrapNoTag(id, className, '‘', children, '’')
    case 'asciimath':
      return wrapNoTag(id, className, '\\$', children, '\\$')
    case 'latexmath':
      return wrapNoTag(id, className, '\\(', children, '\\)')
    case 'unquoted':
      if (id || className)
        return (
          <span id={id} className={className}>
            {children}
          </span>
        )
      return <>{children}</>
  }
}

// Tagless quoted spans (smart quotes, stem) wrap their delimiters + content in
// a `<span>` when they carry an id/role, otherwise emit the bare delimiters.
const wrapNoTag = (
  id: string | undefined,
  className: string | undefined,
  open: string,
  children: ReactNode,
  close: string,
): ReactNode => {
  if (id || className) {
    return (
      <span id={id} className={className}>
        {open}
        {children}
        {close}
      </span>
    )
  }
  return (
    <>
      {open}
      {children}
      {close}
    </>
  )
}

const defaultAnchor = (node: AnchorNode, children: ReactNode): ReactNode => {
  switch (node.subtype) {
    case 'link': {
      const rel = node.window === '_blank' ? 'noopener' : undefined
      return (
        <a
          href={dec(node.target)}
          id={node.id || undefined}
          className={node.role || undefined}
          target={node.window || undefined}
          rel={rel}
        >
          {children}
        </a>
      )
    }
    case 'ref':
      return <a id={node.id || node.target} />
    case 'xref': {
      const t = node.target
      const href = t.startsWith('#') || t.includes('#') || t.includes('/') ? t : `#${t}`
      return (
        <a href={dec(href)} id={node.id || undefined} className={node.role || undefined}>
          {children}
        </a>
      )
    }
    case 'bibref':
      return (
        <>
          {'['}
          <a id={node.id || node.target} />
          {']'}
        </>
      )
  }
}

const encodeImageSrc = (target: string): string => dec(target).replace(/ /g, '%20')

const defaultImage = (node: ImageNode): ReactNode => {
  const wrapLink = (inner: ReactNode): ReactNode => {
    if (!node.link) return inner
    const rel = node.window === '_blank' ? 'noopener' : undefined
    return (
      <a
        className="image"
        href={dec(node.link)}
        target={node.window || undefined}
        rel={rel}
      >
        {inner}
      </a>
    )
  }
  const classes = [node.subtype === 'icon' ? 'icon' : 'image']
  if (node.role) classes.push(node.role)
  if (node.float) classes.push(node.float)
  const className = classes.join(' ')
  const id = node.id || undefined
  const title = node.title ? dec(node.title) : undefined

  if (node.subtype === 'icon') {
    const iconType = node.iconType || 'text'
    if (iconType === 'text') {
      return (
        <span className={className} id={id} title={title}>
          {wrapLink(`[${dec(node.alt || node.target)}]`)}
        </span>
      )
    }
    if (iconType === 'font') {
      // Font-icon title sits on the <i>, not the wrapper span.
      return (
        <span className={className} id={id}>
          {wrapLink(<i className={`fa fa-${node.target}`} title={title} />)}
        </span>
      )
    }
    return (
      <span className={className} id={id} title={title}>
        {wrapLink(
          <img
            src={encodeImageSrc(node.target)}
            alt={dec(node.alt) || ''}
            width={node.width || undefined}
            height={node.height || undefined}
          />,
        )}
      </span>
    )
  }
  return (
    <span className={className} id={id}>
      {wrapLink(
        <img
          src={encodeImageSrc(node.target)}
          alt={dec(node.alt) || ''}
          width={node.width || undefined}
          height={node.height || undefined}
          title={title}
        />,
      )}
    </span>
  )
}

const defaultFootnote = (node: FootnoteNode, children: ReactNode): ReactNode => {
  // Reference-only form (footnoteref / footnote:id[] with a prior definition).
  if (node.refid && (!node.text || node.text.length === 0)) {
    if (node.index !== undefined) {
      return (
        <sup className="footnoteref">
          {'['}
          <a
            className="footnote"
            href={`#_footnotedef_${node.index}`}
            title="View footnote."
          >
            {node.index}
          </a>
          {']'}
        </sup>
      )
    }
    return (
      <sup className="footnoteref red" title="Unresolved footnote reference.">
        {`[${dec(node.refid)}]`}
      </sup>
    )
  }
  const idx = node.index
  if (idx === undefined) {
    return (
      <sup id={node.id || undefined}>
        {'['}
        {children}
        {']'}
      </sup>
    )
  }
  return (
    <sup className="footnote" id={node.id ? `_footnote_${node.id}` : undefined}>
      {'['}
      <a
        id={`_footnoteref_${idx}`}
        className="footnote"
        href={`#_footnotedef_${idx}`}
        title="View footnote."
      >
        {idx}
      </a>
      {']'}
    </sup>
  )
}

const defaultKbd = (node: KeyboardNode): ReactNode => {
  if (node.keys.length === 1) return <kbd>{dec(node.keys[0])}</kbd>
  return (
    <span className="keyseq">
      {node.keys.map((k, i) => (
        <Fragment key={i}>
          {i > 0 ? '+' : null}
          <kbd>{dec(k)}</kbd>
        </Fragment>
      ))}
    </span>
  )
}

const defaultMenu = (node: MenuNode, iconsFont: boolean): ReactNode => {
  if (node.items.length === 1) return <b className="menuref">{dec(node.items[0])}</b>
  const caret = iconsFont ? (
    <i className="fa fa-angle-right caret" />
  ) : (
    <b className="caret">{'›'}</b>
  )
  return (
    <span className="menuseq">
      {node.items.map((item, i) => {
        const cls = i === 0 ? 'menu' : i < node.items.length - 1 ? 'submenu' : 'menuitem'
        return (
          <Fragment key={i}>
            {i > 0 ? (
              <>
                {' '}
                {caret}{' '}
              </>
            ) : null}
            <b className={cls}>{dec(item)}</b>
          </Fragment>
        )
      })}
    </span>
  )
}

export default RenderInline
