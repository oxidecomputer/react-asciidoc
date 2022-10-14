import type { Asciidoctor } from 'asciidoctor'

import { Content } from '../'

const UList = ({ node }: { node: Asciidoctor.List }) => {
  return (
    <div
      id={node.getId ? node.getId() : ''}
      className={`ulist ${node.getStyle() || ''} ${node.getRole() || ''}`}
    >
      {node.hasTitle() && <div className="title">{node.getCaptionedTitle()}</div>}
      <ul>
        {node.getItems().map((item: Asciidoctor.ListItem, index) => (
          <li key={index} id={item.getId()} className={item.getRole() || ''}>
            <p dangerouslySetInnerHTML={{ __html: item.getText() }} />
            <Content blocks={item.getBlocks()} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UList
