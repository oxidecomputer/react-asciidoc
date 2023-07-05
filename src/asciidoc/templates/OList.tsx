import type { List, ListItem } from '@asciidoctor/core'
import cn from 'classnames'
import parse from 'html-react-parser'

import { Content } from '../'
import { Title, getLineNumber, getRole } from './util'

const OList = ({ node }: { node: List }) => {
  return (
    <div className={cn('olist', getRole(node), node.getStyle())} {...getLineNumber(node)}>
      <Title node={node} />
      <ol
        className={node.getStyle()}
        reversed={node.isOption('reversed')}
        start={node.getAttribute('start')}
      >
        {node.getItems().map((item: ListItem, index) => (
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
