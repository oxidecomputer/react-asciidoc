import cn from 'classnames'

import { Content } from '..'
import RenderInline from '../RenderInline'
import { type Block } from '../utils/prepareDocument'
import { Title } from './util'

const Quote = ({ node }: { node: Block }) => {
  const attribution = node.attributes['attribution']
  const citetitle = node.attributes['citetitle']

  let attribHtml = ''
  if (attribution) {
    attribHtml = `&#8212; ${attribution}`
    if (citetitle) attribHtml += `<br>\n<cite>${citetitle}</cite>`
  } else if (citetitle) {
    attribHtml = `<cite>${citetitle}</cite>`
  }

  return (
    <div
      id={node.id || undefined}
      className={cn('quoteblock', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      {node.inlines ? (
        <blockquote>
          <RenderInline nodes={node.inlines} />
        </blockquote>
      ) : (
        <blockquote>
          <Content blocks={node.blocks} />
        </blockquote>
      )}
      {attribHtml && (
        <div
          className="attribution"
          dangerouslySetInnerHTML={{ __html: attribHtml }}
        />
      )}
    </div>
  )
}

export default Quote
