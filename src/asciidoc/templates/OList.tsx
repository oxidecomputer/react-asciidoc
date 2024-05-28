import cn from 'classnames'
import parse from 'html-react-parser'

import { Content } from '../'
import { type ListBlock, type ListItemBlock, isOption } from '../utils/prepareDocument'
import { Title } from './util'

const OList = ({ node }: { node: ListBlock }) => (
  <div
    className={cn('olist', node.role, node.style)}
    {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
  >
    <Title text={node.title} />
    <ol
      className={node.style}
      reversed={isOption(node.attributes, 'reversed')}
      {...(node.attributes['start']
        ? { start: parseInt(`${node.attributes['start']}`) }
        : {})}
    >
      {node.items.map((item: ListItemBlock, index) => (
        <li key={index} className={node.role ? node.role : ''}>
          <p>{parse(item.text || '')}</p>
          <Content blocks={item.blocks} />
        </li>
      ))}
    </ol>
  </div>
)

export default OList
