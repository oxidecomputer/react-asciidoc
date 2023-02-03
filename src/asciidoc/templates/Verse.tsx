import type { Block } from '@asciidoctor/core'
import cn from 'classnames'

import useGetContent from '../hooks/useGetContent'
import { Title, getRole } from './util'

const Verse = ({ node }: { node: Block }) => {
  const attribution = node.getAttribute('attribution')
  const citetitle = node.getAttribute('citetitle')
  const content = useGetContent(node)

  return (
    <div id={node.getId ? node.getId() : ''} className={cn('verseblock', getRole(node))}>
      <Title node={node} />
      <pre className="content" dangerouslySetInnerHTML={{ __html: content }} />
      {attribution && (
        <div className="attribution">
          — {attribution}
          {citetitle && <cite>{citetitle}</cite>}
        </div>
      )}
    </div>
  )
}

export default Verse
