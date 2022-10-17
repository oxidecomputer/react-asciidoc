import type { Asciidoctor } from 'asciidoctor'
import { createElement } from 'react'

import { Content } from '../'

const Section = ({ node }: { node: Asciidoctor.Section }) => {
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
  } else if (node.isNumbered() && level < sectNumLevels) {
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
      <a
        className="link"
        href={`#${node.getId()}`}
        dangerouslySetInnerHTML={{
          __html: title,
        }}
      />
    )
  }

  if (level === 0) {
    return (
      <>
        <a className="sectionanchor" id={`${node.getId() || ''}`} />
        <h1 className={`sect0${node.getRole() || ''}`} data-sectnum={sectNum}>
          {title}
        </h1>
        <Content blocks={node.getBlocks()} />
      </>
    )
  } else {
    return (
      <div className={`sect${level} ${node.getRole() || ''}`}>
        <a className="sectionanchor" id={`${node.getId() || ''}`} />
        {createElement(`h${level + 1}`, { 'data-sectnum': sectNum }, title)}
        <div className="sectionbody">
          <Content blocks={node.getBlocks()} />
        </div>
      </div>
    )
  }
}

export default Section
