import { Content, useConverterContext } from '../'
import { type BaseBlock } from '../utils/prepareDocument'
import Outline from './Outline'

const Preamble = ({ node }: { node: BaseBlock }) => {
  const { document } = useConverterContext()
  const docAttrs = document.attributes || {}

  const hasToc =
    docAttrs['toc-placement'] === 'preamble' &&
    document.sections &&
    document.sections.length > 0 &&
    docAttrs['toc'] !== undefined

  const tocTitle = docAttrs['toc-title'] || 'Table of Contents'
  const tocClass = docAttrs['toc-class'] || 'toc'

  return (
    <div id="preamble" {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}>
      <div className="sectionbody">
        <Content blocks={node.blocks} />
      </div>
      {hasToc && (
        <div id="toc" className={`${tocClass}`}>
          <div id="toctitle" dangerouslySetInnerHTML={{ __html: `${tocTitle}` }} />
          <Outline sections={document.sections!} />
        </div>
      )}
    </div>
  )
}

export default Preamble
