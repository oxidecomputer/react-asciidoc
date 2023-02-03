import type { Block } from '@asciidoctor/core'
import cn from 'classnames'

import { Content } from '../'
import { CaptionedTitle } from './util'
import { getRole } from './util'

const Example = ({ node }: { node: Block }) => {
  return (
    <div className={cn('exampleblock', getRole(node))}>
      <CaptionedTitle node={node} />
      <div className="content">
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}
export default Example
