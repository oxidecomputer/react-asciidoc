import cn from 'classnames'
import { createElement, useContext } from 'react'

import { Content, Context } from '../'
import { SectionBlock } from '../utils/prepareDocument'

const Section = ({ node }: { node: SectionBlock }) => {
  const { document } = useContext(Context)
  const docAttrs = document.attributes || {}

  let title: JSX.Element | string = node.title

  let sectNum = node.num
  sectNum = sectNum === '.' ? '' : sectNum

  const sectNumLevels = docAttrs['sectnumlevels'] ? parseInt(docAttrs['sectnumlevels']) : 3

  if (node.numbered && node.level <= sectNumLevels) {
    title = `${sectNum} ${node.title}`
  }

  if (docAttrs.sectlinks) {
    title = (
      <>
        <a
          className="anchor"
          id={node.id || ''}
          {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
        />
        <a
          className="link"
          href={`#${node.id}`}
          dangerouslySetInnerHTML={{
            __html: title,
          }}
        />
      </>
    )
  }

  if (node.level === 0) {
    return (
      <>
        <h1
          className={cn('sect0', node.role)}
          data-sectnum={sectNum}
          {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
        >
          {title}
        </h1>
        <Content blocks={node.blocks} />
      </>
    )
  } else {
    return (
      <div
        className={cn(`sect${node.level}`, node.role)}
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        {createElement(`h${node.level + 1}`, { 'data-sectnum': sectNum }, title)}
        <div className="sectionbody">
          <Content blocks={node.blocks} />
        </div>
      </div>
    )
  }
}

export default Section
