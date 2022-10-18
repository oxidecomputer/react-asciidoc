import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

import { Content } from '../'
import { Title } from './util'

const OList = ({ node }: { node: Asciidoctor.List }) => {
  return (
    <div className={`olist ${node.getStyle()} ${node.getRole()}`}>
      <Title node={node} />
      <ol
        className={node.getStyle()}
        reversed={node.isOption('reversed')}
        start={node.getAttribute('start')}
      >
        {node.getItems().map((item: Asciidoctor.ListItem, index) => (
          <li key={index} className={`${item.getRole()}`}>
            <p>{parse(item.getText())}</p>
            <Content blocks={item.getBlocks()} />
          </li>
        ))}
      </ol>
    </div>
  )
}
export default OList
