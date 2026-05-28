import cn from 'classnames'
import { createElement } from 'react'

import { Content, inlineHtml, useConverterContext } from '../'
import { type SectionBlock } from '../utils/prepareDocument'

const Section = ({ node }: { node: SectionBlock }) => {
  const { document } = useConverterContext()
  const docAttrs = document.attributes || {}

  const sectNumLevels = docAttrs['sectnumlevels']
    ? parseInt(`${docAttrs['sectnumlevels']}`)
    : 3

  const numbered =
    node.numbered && node.num && node.num !== '.' && node.level <= sectNumLevels
  const titlePrefix = numbered ? `${node.num} ` : ''
  const titleHtml = titlePrefix + inlineHtml(node.titleInlines).__html

  const hasAnchor = docAttrs['sectanchors'] !== undefined
  const hasLink = docAttrs['sectlinks'] !== undefined

  // We pre-build the heading inner HTML so the entity choices made by our
  // inline renderer (e.g. &#8217;) survive — passing them through React
  // children would decode them to the corresponding Unicode characters.
  let headingHtml: string
  if (node.id && (hasAnchor || hasLink)) {
    const anchor = hasAnchor ? `<a class="anchor" href="#${node.id}"></a>` : ''
    const titleNode = hasLink
      ? `<a class="link" href="#${node.id}">${titleHtml}</a>`
      : titleHtml
    headingHtml = `${anchor}${titleNode}`
  } else {
    headingHtml = titleHtml
  }

  const heading = createElement(`h${node.level + 1}`, {
    id: node.id || undefined,
    ...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {}),
    dangerouslySetInnerHTML: { __html: headingHtml },
  })

  if (node.level === 0) {
    return (
      <>
        {createElement('h1', {
          id: node.id || undefined,
          className: cn('sect0', node.role),
          ...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {}),
          dangerouslySetInnerHTML: { __html: headingHtml },
        })}
        <Content blocks={node.blocks} />
      </>
    )
  }

  // sect1 wraps children in `<div class="sectionbody">`; sect2+ render
  // children directly.
  if (node.level === 1) {
    return (
      <div
        className={cn(`sect${node.level}`, node.role)}
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        {heading}
        <div className="sectionbody">
          <Content blocks={node.blocks} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(`sect${node.level}`, node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      {heading}
      <Content blocks={node.blocks} />
    </div>
  )
}

export default Section
