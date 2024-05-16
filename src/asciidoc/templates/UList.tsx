import cn from 'classnames'
import parse from 'html-react-parser'

import { Content } from '../'
import { ListBlock, ListItemBlock, isOption } from '../utils/prepareDocument'
import { Title } from './util'

const UList = ({ node }: { node: ListBlock }) => {
  const isChecklist = isOption(node.attributes, 'checklist')

  return (
    <div
      {...(node.id ? { id: node.id } : {})}
      className={cn('ulist', node.style, node.role, isChecklist && 'checklist')}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <ul className={isChecklist ? 'checklist' : ''}>
        {node.items.map((item: ListItemBlock, index) => {
          if (isChecklist) {
            return (
              <li key={index} id={item.id} className={node.role}>
                <p>
                  {isChecklist && item.attributes['checkbox'] && (
                    <i
                      className={cn(
                        'fa',
                        item.attributes['checked'] ? 'fa-check-square-o' : 'fa-square-o',
                      )}
                    />
                  )}{' '}
                  {parse(item.text || '')}
                </p>
              </li>
            )
          } else {
            return (
              <li key={index} id={item.id} className={node.role}>
                <p dangerouslySetInnerHTML={{ __html: item.text || '' }} />
                <Content blocks={item.blocks} />
              </li>
            )
          }
        })}
      </ul>
    </div>
  )
}

export default UList
