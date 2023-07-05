import type { Block } from '@asciidoctor/core'

import { Title, getLineNumber } from './util'

const Literal = ({ node }: { node: Block }) => {
  const docAttrs = node.getDocument().getAttributes()
  const nowrap = docAttrs['prewrap'] === undefined || node.isOption('nowrap')

  return (
    <div className="literalblock" {...getLineNumber(node)}>
      <Title node={node} />
      <div className="content">
        <pre className={nowrap ? 'nowrap' : ''}>{node.getSource()}</pre>
      </div>
    </div>
  )
}

export default Literal
