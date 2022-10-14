import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'
import { Fragment } from 'react'

import { Content } from '../'

const DList = ({ node }: { node: Asciidoctor.List }) => {
  return (
    <div className={`dlist ${node.getStyle()} ${node.getRole()}`}>
      {node.getItems().map((item: any, index) => {
        const listItem: [Asciidoctor.ListItem[], Asciidoctor.ListItem] = item
        const terms = listItem[0]
        const dd = listItem[1]

        return (
          <dl key={index}>
            <dt>
              {terms.map((dt: Asciidoctor.ListItem, index: number) => (
                <Fragment key={index}>{dt.getText()}</Fragment>
              ))}
            </dt>

            {dd && (
              <dd>
                {dd.hasBlocks() ? (
                  <Content blocks={dd.getBlocks()} />
                ) : (
                  <p>{parse(dd.getText())}</p>
                )}
              </dd>
            )}
          </dl>
        )
      })}
    </div>
  )
}
export default DList
