import cn from 'classnames'

import { Block } from '../utils/prepareDocument'
import { Title } from './util'

const Verse = ({ node }: { node: Block }) => {
  const attribution = node.attributes['attribution']
  const citetitle = node.attributes['citetitle']

  return (
    <div
      {...(node.id ? { id: node.id } : {})}
      className={cn('verseblock', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      {node.content && (
        <pre className="content" dangerouslySetInnerHTML={{ __html: node.content }} />
      )}
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
