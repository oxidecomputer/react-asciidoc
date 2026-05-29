import cn from 'classnames'

import RenderInline from '../RenderInline'
import { type ParagraphBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Paragraph = ({ node }: { node: ParagraphBlock }) => (
  <div
    {...(node.id ? { id: node.id } : {})}
    className={cn('paragraph', node.role)}
    {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
  >
    <Title text={node.title} />
    {/* Render from our own inline AST (the vendored parser) as a real React
        tree, never asciidoctor's `content` HTML. */}
    {node.inlines && (
      <p>
        <RenderInline nodes={node.inlines} />
      </p>
    )}
  </div>
)

export default Paragraph
