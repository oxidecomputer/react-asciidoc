import type { Block } from '@asciidoctor/core'
import cn from 'classnames'

import { getContent } from '../utils/getContent'
import { getRole } from './util'
import { Title, getLineNumber } from './util'

const Quote = ({ node }: { node: Block }) => {
  const attribution = node.getAttribute('attribution')
  const citetitle = node.getAttribute('citetitle')
  const content = getContent(node)

  return (
    <div
      {...(node.getId() ? { id: node.getId() } : {})}
      className={cn('quoteblock', getRole(node))}
      {...getLineNumber(node)}
    >
      <Title node={node} />
      <blockquote dangerouslySetInnerHTML={{ __html: content }} />
      {attribution && (
        <div className="attribution">
          — {attribution}
          {citetitle && <cite>{citetitle}</cite>}
        </div>
      )}
    </div>
  )
}

export default Quote
