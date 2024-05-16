import type { List, ListItem } from '@asciidoctor/core'
import parse from 'html-react-parser'

import { Content } from '../'
import { getText } from '../utils/getContent'
import { CoListBlock, ListItemBlock } from '../utils/prepareDocument'
import { Title, getLineNumber } from './util'

const CoList = ({ node }: { node: CoListBlock }) => (
  <div className="colist" {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}>
    <Title text={node.title} />
    <table>
      <tbody>
        {node.items.map((item: ListItemBlock, index) => (
          <tr key={index}>
            <td>
              <i className="conum" data-value={index + 1} />
              <b>{index + 1}</b>
            </td>
            <td>
              {item.text && parse(item.text)}
              <Content blocks={item.blocks} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default CoList
