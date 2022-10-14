import type { Asciidoctor } from 'asciidoctor'
import { createElement } from 'react'

import { Content } from '../'

const Section = ({ node }: { node: Asciidoctor.Block }) => {
  const docAttrs = node.getDocument().getAttributes()
  const level = node.getLevel()
  let title: JSX.Element | string = ''

  if (node.getCaption()) {
    title = node.getCaptionedTitle()
  } else {
    title = node.getTitle() || ''
  }

  if (docAttrs.sectlinks) {
    title = (
      <a
        href={`#${node.getId()}`}
        dangerouslySetInnerHTML={{
          __html: node.getCaption() ? node.getCaptionedTitle() : node.getTitle() || '',
        }}
      />
    )
  }

  // @ts-ignore
  // Swap with getSectionNumeral() when it is released
  let sectNum = node.$sectnum()
  sectNum = sectNum === '.' ? '' : sectNum

  if (level === 0) {
    return (
      <div className="sectionbody">
        <a className="sectionanchor" id={`${node.getId() || ''}`} />
        <h1 className={`sect0${node.getRole() || ''}`} data-sectnum={sectNum}>
          {title}
        </h1>
      </div>
    )
  } else {
    return (
      <>
        <div className={`sect${level}${node.getRole() || ''}`}>
          <a className="sectionanchor" id={`${node.getId() || ''}`} />
          {createElement(`h${level + 1}`, { 'data-sectnum': sectNum }, title)}
          <Content blocks={node.getBlocks()} />
        </div>
      </>
    )
  }
}

export default Section
