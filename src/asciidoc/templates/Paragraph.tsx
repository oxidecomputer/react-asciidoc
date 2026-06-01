import cn from 'classnames'

import { useConverterContext } from '..'
import RenderInline, { inlineHtml } from '../RenderInline'
import { type ParagraphBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Paragraph = ({ node }: { node: ParagraphBlock }) => {
  const { inlineOverrides, document } = useConverterContext()
  const iconsFont = document?.attributes?.['icons'] === 'font'
  // Default to the byte-parity HTML-string path (raw passthrough HTML such as
  // an embedded `<iframe>` must survive verbatim — React's JSX path would
  // rewrite `frameborder` → `frameBorder` and drop `onmousewheel=""`). Only
  // walk the AST as a React tree when consumers want inline-level overrides.
  const useOverrides = inlineOverrides && Object.keys(inlineOverrides).length > 0
  return (
    <div
      {...(node.id ? { id: node.id } : {})}
      className={cn('paragraph', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      {node.inlines &&
        (useOverrides ? (
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
