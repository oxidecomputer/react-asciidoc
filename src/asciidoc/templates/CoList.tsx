import parse from 'html-react-parser'

import type { Asciidoctor } from '~/lib/asciidoctor'

import { Content } from '../'
import { Title } from './util'

const CoList = ({ node }: { node: Asciidoctor.List }) => {
  return (
    <div className="colist">
      <Title node={node} />
      <table>
        <tbody>
          {node.getItems().map((item: Asciidoctor.ListItem, index) => (
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
