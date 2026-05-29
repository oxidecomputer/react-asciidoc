import cn from 'classnames'

import { useConverterContext } from '..'
import { type LiteralBlock, isOption } from '../utils/prepareDocument'
import { Title } from './util'

const Literal = ({ node }: { node: LiteralBlock }) => {
  const { document } = useConverterContext()
  const docAttrs = document.attributes || {}
  const nowrap = isOption(node.attributes, 'nowrap') || docAttrs['prewrap'] === undefined

  return (
    <div
      id={node.id || undefined}
      className={cn('literalblock', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <div className="content">
        <pre
          className={cn(nowrap && 'nowrap') || undefined}
          dangerouslySetInnerHTML={{ __html: node.content || '' }}
        />
      </div>
    </div>
  )
}

export default Literal
