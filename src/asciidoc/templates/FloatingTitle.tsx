import type { Block } from '@asciidoctor/core'
import cn from 'classnames'
import parse from 'html-react-parser'
import { createElement } from 'react'

import { getLineNumber, getRole } from './util'

const FloatingTitle = ({ node }: { node: Block }) => {
  const level = node.getLevel()
  return (
    <>
      <a
        className="sectionanchor"
        {...(node.getId() ? { id: node.getId() } : {})}
        {...getLineNumber(node)}
      />
      {createElement(
        `h${level + 1}`,
        { className: cn(getRole(node), node.getStyle()) },
        parse(node.getTitle() || ''),
      )}
    </>
  )
}

export default FloatingTitle
