import cn from 'classnames'
import parse from 'html-react-parser'

import { Content } from '..'
import { type Block } from '../utils/prepareDocument'
import { Title } from './util'

const Quote = ({ node }: { node: Block }) => {
  const attribution = node.attributes['attribution']
  const citetitle = node.attributes['citetitle']

  return (
    <div
      {...(node.id ? { id: node.id } : {})}
      className={cn('quoteblock', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      {node.content && <blockquote dangerouslySetInnerHTML={{ __html: node.content }} />}
      <Content blocks={node.blocks} />
      {attribution && (
        <div className="attribution">
          — {parse(attribution.toString())}
          {citetitle && <cite>{citetitle}</cite>}
        </div>
      )}
    </div>
  )
}

export default Quote
