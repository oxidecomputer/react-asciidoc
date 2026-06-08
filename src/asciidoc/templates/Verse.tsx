import cn from 'classnames'

import RenderInline, { inlineHtml, useInlineRenderMode } from '../RenderInline'
import { type Block } from '../utils/prepareDocument'
import { Title } from './util'

const Verse = ({ node }: { node: Block }) => {
  const { react, iconsFont } = useInlineRenderMode(node.inlines)
  const attribution = node.attributes['attribution']
  const citetitle = node.attributes['citetitle']

  let attribHtml = ''
  if (attribution || citetitle) {
    if (attribution) {
      attribHtml = `&#8212; ${attribution}`
      if (citetitle) attribHtml += `<br>\n<cite>${citetitle}</cite>`
    } else if (citetitle) {
      attribHtml = `<cite>${citetitle}</cite>`
    }
  }

  return (
    <div
      id={node.id || undefined}
      className={cn('verseblock', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      {node.inlines &&
        (react ? (
          <pre className="content">
            <RenderInline nodes={node.inlines} />
          </pre>
        ) : (
          <pre
            className="content"
            dangerouslySetInnerHTML={inlineHtml(node.inlines, iconsFont)}
          />
        ))}
      {attribHtml && (
        <div className="attribution" dangerouslySetInnerHTML={{ __html: attribHtml }} />
      )}
    </div>
  )
}

export default Verse
