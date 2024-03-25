import type { Block } from '@asciidoctor/core'
import cn from 'classnames'

import { getContent } from '../utils/getContent'
import { Title, getLineNumber, getRole } from './util'

const Paragraph = ({ node }: { node: Block }) => {
  const content = getContent(node)

  return (
    <div
      {...(node.getId() ? { id: node.getId() } : {})}
      className={cn('paragraph', getRole(node))}
      {...getLineNumber(node)}
    >
      <Title node={node} />
      <p dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export default Paragraph
