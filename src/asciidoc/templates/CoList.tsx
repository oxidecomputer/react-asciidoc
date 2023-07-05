import type { List, ListItem } from '@asciidoctor/core'
import parse from 'html-react-parser'

import { Content } from '../'
import { Title, getLineNumber } from './util'

const CoList = ({ node }: { node: List }) => {
  return (
    <div className="colist" {...getLineNumber(node)}>
      <Title node={node} />
      <table>
        <tbody>
          {node.getItems().map((item: ListItem, index) => (
            <tr key={index}>
              <td>
                <i className="conum" data-value={index + 1} />
                <b>{index + 1}</b>
              </td>
              <td>
                {parse(item.getText())}
                <Content blocks={item.getBlocks()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default CoList
