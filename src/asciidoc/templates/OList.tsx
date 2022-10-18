import type { Asciidoctor } from 'asciidoctor'
import cn from 'classnames'
import parse from 'html-react-parser'

import { Content } from '../'
import { Title, getRole } from './util'

const OList = ({ node }: { node: Asciidoctor.List }) => {
  return (
    <div className={cn('olist', getRole(node), node.getStyle())}>
      <Title node={node} />
      <ol
        className={node.getStyle()}
        reversed={node.isOption('reversed')}
        start={node.getAttribute('start')}
      >
        {node.getItems().map((item: Asciidoctor.ListItem, index) => (
          <li key={index} className={getRole(node) ? getRole(node) : ''}>
            <p>{parse(item.getText())}</p>
            <Content blocks={item.getBlocks()} />
          </li>
        ))}
      </ol>
    </div>
  )
}
export default OList
