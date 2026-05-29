import cn from 'classnames'

import { inlineHtml } from '../'
import { type ParagraphBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Paragraph = ({ node }: { node: ParagraphBlock }) => (
  <div
    {...(node.id ? { id: node.id } : {})}
    className={cn('paragraph', node.role)}
    {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
  >
    <Title text={node.title} />
    {/* Render from our own inline AST (the vendored parser), not asciidoctor's
        `content` HTML. `content` is kept only as a defensive fallback for the
        rare paragraph whose inlines weren't parsed. */}
    {node.inlines ? (
      <p dangerouslySetInnerHTML={inlineHtml(node.inlines)} />
    ) : (
      node.content && <p dangerouslySetInnerHTML={{ __html: node.content }} />
    )}
  </div>
)

export default Paragraph
