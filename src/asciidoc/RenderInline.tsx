import { Fragment, useContext, type ComponentType, type ReactNode } from 'react'

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
 * `dangerouslySetInnerHTML`. This is what templates use by default so the
 * React output is byte-identical to stock asciidoctor (entity encoding,
 * attribute order, void-element form). For consumers that want React-level
 * inline customisation, use `<RenderInline>` and supply
 * `options.inlineOverrides`.
 */
export const inlineHtml = (
  nodes: InlineNode[] | undefined,
): { __html: string } => ({ __html: nodes ? renderInlineAsString(nodes) : '' })

/**
 * Per-subtype React overrides for inline nodes. When a consumer registers
 * an override, the matching inline subtype is rendered through that
 * component instead of the default HTML-string path.
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

/**
 * Render an inline AST as React. By default the AST is serialised back to
 * HTML via the same renderer that powers the test harness, so output is
 * byte-identical to stock asciidoctor. When the Asciidoc context supplies
 * `inlineOverrides`, the tree is walked and matching subtypes are rendered
 * through their override components — at the cost of byte-parity with
 * stock asciidoctor (React adjusts attribute order and entity escaping).
 */
const RenderInline = ({ nodes }: { nodes: InlineNode[] | undefined }) => {
  const ctx = useContext(Context)
  const overrides = ctx.inlineOverrides

  if (!nodes || nodes.length === 0) return null

  if (!overrides || Object.keys(overrides).length === 0) {
    return <span dangerouslySetInnerHTML={{ __html: renderInlineAsString(nodes) }} />
  }

  return <>{walk(nodes, overrides)}</>
}

const walk = (nodes: InlineNode[], overrides: InlineOverrides): ReactNode[] =>
  nodes.map((node, i) => <Fragment key={i}>{renderNode(node, overrides)}</Fragment>)

const renderNode = (node: InlineNode, overrides: InlineOverrides): ReactNode => {
  switch (node.type) {
    case 'text':
      return <span dangerouslySetInnerHTML={{ __html: node.text }} />
    case 'quoted': {
      const Override = overrides.quoted
      const children = walk(node.text, overrides)
      if (Override) return <Override node={node}>{children}</Override>
      return defaultQuoted(node, children)
    }
    case 'anchor': {
      const Override = overrides.anchor
      const children = walk(node.text, overrides)
      if (Override) return <Override node={node}>{children}</Override>
      return defaultAnchor(node, children)
    }
    case 'image': {
      const Override = overrides.image
      if (Override) return <Override node={node} />
      return <span dangerouslySetInnerHTML={{ __html: renderInlineAsString([node]) }} />
    }
    case 'footnote': {
      const Override = overrides.footnote
      const children = walk(node.text || [], overrides)
      if (Override) return <Override node={node}>{children}</Override>
      return <span dangerouslySetInnerHTML={{ __html: renderInlineAsString([node]) }} />
    }
    case 'indexterm': {
      const Override = overrides.indexterm
      if (Override) return <Override node={node} />
      return node.visible ? node.terms.join(', ') : null
    }
    case 'callout': {
      const Override = overrides.callout
      if (Override) return <Override node={node} />
      return <b className="conum">{`(${node.number})`}</b>
    }
    case 'break': {
      const Override = overrides.break
      if (Override) return <Override />
      return <br />
    }
    case 'button': {
      const Override = overrides.button
      const children = walk(node.text, overrides)
      if (Override) return <Override node={node}>{children}</Override>
      return <b className="button">{children}</b>
    }
    case 'kbd': {
      const Override = overrides.kbd
      if (Override) return <Override node={node} />
      return <span dangerouslySetInnerHTML={{ __html: renderInlineAsString([node]) }} />
    }
    case 'menu': {
      const Override = overrides.menu
      if (Override) return <Override node={node} />
      return <span dangerouslySetInnerHTML={{ __html: renderInlineAsString([node]) }} />
    }
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
      if (id || className) {
        return (
          <span id={id} className={className}>
            {children}
          </span>
        )
      }
      return <mark>{children}</mark>
    case 'double':
      return (
        <>
          {'“'}
          {children}
          {'”'}
        </>
      )
    case 'single':
      return (
        <>
          {'‘'}
          {children}
          {'’'}
        </>
      )
    case 'asciimath':
      return (
        <>
          {'\\$'}
          {children}
          {'\\$'}
        </>
      )
    case 'latexmath':
      return (
        <>
          {'\\('}
          {children}
          {'\\)'}
        </>
      )
    case 'unquoted':
      if (id || className) {
        return (
          <span id={id} className={className}>
            {children}
          </span>
        )
      }
      return <>{children}</>
  }
}

const defaultAnchor = (node: AnchorNode, children: ReactNode): ReactNode => {
  switch (node.subtype) {
    case 'link': {
      const rel = node.window === '_blank' ? 'noopener' : undefined
      return (
        <a
          href={node.target}
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
        <a href={href} id={node.id || undefined} className={node.role || undefined}>
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

export default RenderInline
