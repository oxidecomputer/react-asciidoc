import { useConverterContext } from '..'
import { type LiteralBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Literal = ({ node }: { node: LiteralBlock }) => {
  const { document } = useConverterContext()

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
