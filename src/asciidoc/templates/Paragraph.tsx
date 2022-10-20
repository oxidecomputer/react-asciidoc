import type { Asciidoctor } from '~/lib/asciidoctor'
import cn from 'classnames'

import { Title, getRole } from './util'
import useGetContent from '../hooks/useGetContent'

const Paragraph = ({ node }: { node: Asciidoctor.Block }) => {
  const content = useGetContent(node)

  return (
    <div id={node.getId ? node.getId() : ''} className={cn('paragraph', getRole(node))}>
      <Title node={node} />
      <p dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export default Paragraph
