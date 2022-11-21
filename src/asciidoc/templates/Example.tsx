import type { Asciidoctor } from '~/lib/asciidoctor'
import cn from 'classnames'

import { Content } from '../'
import { CaptionedTitle } from './util'
import { getRole } from './util'

const Example = ({ node }: { node: Asciidoctor.Block }) => {
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
