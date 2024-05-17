import type { Block } from '@asciidoctor/core'
import cn from 'classnames'
import parse from 'html-react-parser'
import { createElement } from 'react'

import { type BaseBlock } from '../utils/prepareDocument'

const FloatingTitle = ({ node }: { node: BaseBlock }) => (
  <>
    <a
      className="sectionanchor"
      {...(node.id ? { id: node.id } : {})}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    />
    {createElement(
      `h${node.level + 1}`,
      { className: cn(node.role, node.style) },
      parse(node.title || ''),
    )}
  </>
)

export default FloatingTitle
