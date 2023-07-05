import type { Block } from '@asciidoctor/core'
import { createElement } from 'react'

import { Title, getLineNumber } from './util'

const FloatingTitle = ({ node }: { node: Block }) => {
  const level = node.getLevel()

  return (
    <>
      <a className="sectionanchor" id={`${node.getId() || ''}`} {...getLineNumber(node)} />
      {createElement(`h${level + 1}`, null, <Title node={node} />)}
    </>
  )
}

export default FloatingTitle
