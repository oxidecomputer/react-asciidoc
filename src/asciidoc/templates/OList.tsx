import cn from 'classnames'

import { Content, inlineHtml } from '../'
import { type ListBlock, type ListItemBlock, isOption } from '../utils/prepareDocument'
import { Title } from './util'

const OL_TYPE: Record<string, '1' | 'a' | 'A' | 'i' | 'I'> = {
  upperalpha: 'A',
  loweralpha: 'a',
  upperroman: 'I',
  lowerroman: 'i',
}

const OList = ({ node }: { node: ListBlock }) => {
  const style = node.style
  const type = style ? OL_TYPE[style] : undefined
  const start = node.attributes['start']
    ? parseInt(`${node.attributes['start']}`)
    : undefined

  return (
    <div
      id={node.id || undefined}
      className={cn('olist', style, node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <ol
        className={style || undefined}
        type={type}
        reversed={isOption(node.attributes, 'reversed') || undefined}
        start={start}
      >
        {node.items.map((item: ListItemBlock, index) => (
          <li key={index} id={item.id || undefined}>
            <p dangerouslySetInnerHTML={inlineHtml(item.textInlines)} />
            <Content blocks={item.blocks} />
          </li>
        ))}
      </ol>
    </div>
  )
}

export default OList
