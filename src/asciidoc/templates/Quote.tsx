import type { Block } from '@asciidoctor/core'
import cn from 'classnames'

import useGetContent from '../hooks/useGetContent'
import { getRole } from './util'
import { Title, getLineNumber } from './util'

const Quote = ({ node }: { node: Block }) => {
  const attribution = node.getAttribute('attribution')
  const citetitle = node.getAttribute('citetitle')
  const content = useGetContent(node)

  return (
    <div
      id={node.getId ? node.getId() : ''}
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
