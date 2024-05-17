import parse from 'html-react-parser'
import { useContext } from 'react'

import { Content, Context } from '../'
import { type BaseBlock } from '../utils/prepareDocument'
import Outline from './Outline'

const Preamble = ({ node }: { node: BaseBlock }) => {
  const { document } = useContext(Context)
  const docAttrs = document.attributes || {}

  const hasToc =
    docAttrs['toc-placement'] === 'preamble' &&
    document.sections &&
    document.sections.length > 0 &&
    docAttrs['toc'] !== undefined

  return (
    <div id="preamble" {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}>
      <div className="sectionbody">
        <Content blocks={node.blocks} />
        {hasToc && (
          <div
            id="toc"
            className={node.attributes['toc-class'] ? node.attributes['toc-class'] : 'toc'}
          >
            <div id="toctitle">{parse(docAttrs['toc-title'])}</div>
            {document.sections && <Outline sections={document.sections} />}
          </div>
        )}
      </div>
    </div>
  )
}

export default Preamble
