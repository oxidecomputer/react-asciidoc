import { useContext } from 'react'

import { Context } from '..'
import { LiteralBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Literal = ({ node }: { node: LiteralBlock }) => {
  const { document } = useContext(Context)

  const docAttrs = document.attributes || {}
  const nowrap = node.attributes.nowrap || docAttrs['prewrap'] === undefined

  return (
    <div
      className="literalblock"
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <div className="content">
        <pre className={nowrap ? 'nowrap' : ''}>{node.source}</pre>
      </div>
    </div>
  )
}

export default Literal
