import type { Asciidoctor } from 'asciidoctor'

import { Content } from '../'
import Outline from './Outline'

const Document = ({ document }: { document: Asciidoctor.Document }) => {
  const blocks = document.getBlocks()

  const Header = () => {
    if (!document.getNoheader()) {
      return (
        <div id="header">
          {document.hasHeader() && (
            <>
              <h1>
                <>{document.getDocumentTitle() || ''}</>
              </h1>

              {document.hasSections() &&
                document.hasAttribute('toc') &&
                document.getAttribute('toc-placement', 'auto') && (
                  <div id="toc" className={document.getAttribute('toc-class', 'toc')}>
                    <div id="toctitle">{document.getAttribute('toc-title')}</div>
                    <Outline node={document as Asciidoctor.AbstractBlock} />
                  </div>
                )}
            </>
          )}
        </div>
      )
    } else {
      return null
    }
  }

  const Footnotes = () => {
    if (document.hasFootnotes() && !document.hasAttribute('nofootnotes')) {
      return (
        <div id="footnotes">
          <hr />

          {document.getFootnotes().map((footnote) => (
            <div
              className="footnote"
              id={`_footnotedef_${footnote.getIndex()}`}
              key={footnote.getIndex()}
            >
              <a href={`#_footnoteref_${footnote.getIndex()}`}>{footnote.getIndex()}</a>.{' '}
              {footnote.getText()}
            </div>
          ))}
        </div>
      )
    } else {
      return null
    }
  }

  return (
    <>
      <Header />
      <div id="content">
        <Content blocks={blocks} />
      </div>
      <Footnotes />
    </>
  )
}

export default Document
