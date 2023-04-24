import type { Section as SectionType } from '@asciidoctor/core'
import cn from 'classnames'
import { createElement } from 'react'

import { Content } from '../'
import { getRole } from './util'

const Section = ({ node }: { node: SectionType }) => {
  const docAttrs = node.getDocument().getAttributes()
  const level = node.getLevel()
  let title: JSX.Element | string = ''

  // @ts-ignore
  // Swap with getSectionNumeral() when it is released
  let sectNum = node.$sectnum()
  sectNum = sectNum === '.' ? '' : sectNum

  const sectNumLevels = docAttrs['sectnumlevels'] ? parseInt(docAttrs['sectnumlevels']) : 3

  if (node.getCaption()) {
    title = node.getCaptionedTitle()
  } else if (node.isNumbered() && level <= sectNumLevels) {
    // todo: investigate sectnumlevels overrides not working
    if (level < 2 && node.getDocument().getDoctype() == 'book') {
      const sectionName = node.getSectionName()
      if (sectionName === 'chapter') {
        const signifier = docAttrs['chapter-signifier']
        title = `${signifier || ''} ${sectNum} ${node.getTitle()}`
      } else if (sectionName === 'part') {
        const signifier = docAttrs['part-signifier']
        title = `${signifier || ''} ${sectNum} ${node.getTitle()}`
      } else {
        title = `${sectNum} ${node.getTitle()}`
      }
    } else {
      title = `${sectNum} ${node.getTitle()}`
    }
  } else {
    title = node.getTitle() || ''
  }

  if (docAttrs.sectlinks) {
    title = (
      <>
        <a className="anchor" id={node.getId() || ''} />
        <a
          className="link"
          href={`#${node.getId()}`}
          dangerouslySetInnerHTML={{
            __html: title,
          }}
        />
      </>
    )
  }

  if (level === 0) {
    return (
      <>
        <h1 className={cn('sect0', getRole(node))} data-sectnum={sectNum}>
          {title}
        </h1>
        <Content blocks={node.getBlocks()} />
      </>
    )
  } else {
    return (
      <div className={cn(`sect${level}`, getRole(node))}>
        {createElement(`h${level + 1}`, { 'data-sectnum': sectNum }, title)}
        <div className="sectionbody">
          <Content blocks={node.getBlocks()} />
        </div>
      </div>
    )
  }
}

export default Section
