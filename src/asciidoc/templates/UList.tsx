import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

import { Content } from '../'

const UList = ({ node }: { node: Asciidoctor.List }) => {
  const isChecklist = node.isOption('checklist')

  return (
    <div
      id={node.getId ? node.getId() : ''}
      className={`ulist ${node.getStyle() || ''} ${node.getRole() || ''} ${
        isChecklist ? 'checklist' : ''
      }`}
    >
      {node.hasTitle() && <div className="title">{parse(node.getCaptionedTitle())}</div>}

      <ul className={isChecklist ? 'checklist' : ''}>
        {node.getItems().map((item: Asciidoctor.ListItem, index) => {
          if (isChecklist) {
            return (
              <li key={index} id={item.getId()} className={item.getRole() || ''}>
                <p>
                  {isChecklist && item.hasAttribute('checkbox') && (
                    <i
                      className={`fa ${
                        item.hasAttribute('checked') ? 'fa-check-square-o' : 'fa-square-o'
                      }`}
                    />
                  )}{' '}
                  {parse(item.getText())}
                </p>
              </li>
            )
          } else {
            return (
              <li key={index} id={item.getId()} className={item.getRole() || ''}>
                <p dangerouslySetInnerHTML={{ __html: item.getText() }} />
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
