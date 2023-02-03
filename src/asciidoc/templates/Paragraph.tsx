import type { Block } from '@asciidoctor/core'
import cn from 'classnames'

import useGetContent from '../hooks/useGetContent'
import { Title, getRole } from './util'

const Paragraph = ({ node }: { node: Block }) => {
  const content = useGetContent(node)

  return (
    <div id={node.getId ? node.getId() : ''} className={cn('paragraph', getRole(node))}>
      <Title node={node} />
      <p dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export default Paragraph
