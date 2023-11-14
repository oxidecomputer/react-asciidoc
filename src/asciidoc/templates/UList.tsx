import type { List, ListItem } from '@asciidoctor/core'
import cn from 'classnames'
import parse from 'html-react-parser'

import { Content } from '../'
import { getText } from '../utils/getContent'
import { Title } from './util'
import { getLineNumber, getRole } from './util'

const UList = ({ node }: { node: List }) => {
  const isChecklist = node.isOption('checklist')

  return (
    <div
      id={node.getId ? node.getId() : ''}
      className={cn('ulist', node.getStyle(), getRole(node), isChecklist && 'checklist')}
      {...getLineNumber(node)}
    >
      <Title node={node} />
      <ul className={isChecklist ? 'checklist' : ''}>
        {node.getItems().map((item: ListItem, index) => {
          if (isChecklist) {
            return (
              <li key={index} id={item.getId()} className={getRole(node)}>
                <p>
                  {isChecklist && item.hasAttribute('checkbox') && (
                    <i
                      className={cn(
                        'fa',
                        item.hasAttribute('checked') ? 'fa-check-square-o' : 'fa-square-o',
                      )}
                    />
                  )}{' '}
                  {parse(getText(item))}
                </p>
              </li>
            )
          } else {
            return (
              <li key={index} id={item.getId()} className={getRole(node)}>
                <p dangerouslySetInnerHTML={{ __html: getText(item) }} />
                <Content blocks={item.getBlocks()} />
              </li>
            )
          }
        })}
      </ul>
    </div>
  )
}

export default UList
