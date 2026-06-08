import cn from 'classnames'
import { createElement } from 'react'

import RenderInline from '../RenderInline'
import { type BaseBlock } from '../utils/prepareDocument'

const FloatingTitle = ({ node }: { node: BaseBlock }) =>
  createElement(
    `h${node.level + 1}`,
    {
      id: node.id || undefined,
      className: cn(node.style || 'discrete', node.role),
      ...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {}),
    },
    <RenderInline nodes={node.titleInlines} />,
  )

export default FloatingTitle
