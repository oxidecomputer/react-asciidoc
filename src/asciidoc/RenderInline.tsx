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
export const inlineHtml = (nodes: InlineNode[] | undefined): { __html: string } => ({
  __html: nodes ? renderInlineAsString(nodes) : '',
})

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
}

/**
 * Render an inline AST as a real React element tree. Text and attribute values
 * are entity-decoded so React controls escaping; every node subtype maps to
 * actual elements (no `dangerouslySetInnerHTML`), and consumers can replace
 * any subtype via `options.inlineOverrides`.
 */
const RenderInline = ({ nodes }: { nodes: InlineNode[] | undefined }) => {
  const ctx = useContext(Context)
  if (!nodes || nodes.length === 0) return null
  const rctx: RenderCtx = {
    overrides: ctx.inlineOverrides || {},
    iconsFont: ctx.document?.attributes?.['icons'] === 'font',
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
