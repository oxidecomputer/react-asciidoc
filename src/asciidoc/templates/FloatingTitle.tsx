import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'
import { createElement } from 'react'

const FloatingTitle = ({ node }: { node: Asciidoctor.Block }) => {
  const level = node.getLevel()

  const title = node.hasTitle() && (
    <div className="title">{parse(node.getCaptionedTitle())}</div>
  )

  return (
    <>
      <a className="sectionanchor" id={`${node.getId() || ''}`} />
      {createElement(`h${level + 1}`, null, title)}
    </>
  )
}

export default FloatingTitle
