import type { Asciidoctor } from '@asciidoctor/core'

import { Title } from './util'

const Literal = ({ node }: { node: Asciidoctor.Block }) => {
  const docAttrs = node.getDocument().getAttributes()
  const nowrap = docAttrs['prewrap'] === undefined || node.isOption('nowrap')

  return (
    <div className="literalblock">
      <Title node={node} />
      <div className="content">
        <pre className={nowrap ? 'nowrap' : ''}>{node.getSource()}</pre>
      </div>
    </div>
  )
}

export default Literal
