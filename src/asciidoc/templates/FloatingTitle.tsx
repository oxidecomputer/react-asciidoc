import type { Block } from '@asciidoctor/core'
import { createElement } from 'react'

import { Title } from './util'

const FloatingTitle = ({ node }: { node: Block }) => {
  const level = node.getLevel()

  return (
    <>
      <a className="sectionanchor" id={`${node.getId() || ''}`} />
      {createElement(`h${level + 1}`, null, <Title node={node} />)}
    </>
  )
}

export default FloatingTitle
