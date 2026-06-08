import cn from 'classnames'

import RenderInline, { inlineHtml, useInlineRenderMode } from '../RenderInline'
import { type ParagraphBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Paragraph = ({ node }: { node: ParagraphBlock }) => {
  const { react, iconsFont } = useInlineRenderMode(node.inlines)
  return (
    <div
      {...(node.id ? { id: node.id } : {})}
      className={cn('paragraph', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      {node.inlines &&
        (react ? (
          <p>
            <RenderInline nodes={node.inlines} />
          </p>
        ) : (
          <p dangerouslySetInnerHTML={inlineHtml(node.inlines, iconsFont)} />
        ))}
    </div>
  )
}

export default Paragraph
