import cn from 'classnames'

import { type ParagraphBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Paragraph = ({ node }: { node: ParagraphBlock }) => (
  <div
    {...(node.id ? { id: node.id } : {})}
    className={cn('paragraph', node.role)}
    {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
  >
    <Title text={node.title} />
    {node.content && <p dangerouslySetInnerHTML={{ __html: node.content }} />}
  </div>
)

export default Paragraph
