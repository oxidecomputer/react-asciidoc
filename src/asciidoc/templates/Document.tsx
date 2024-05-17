import parse from 'html-react-parser'
import { Fragment } from 'react'

import { Content } from '../'
import { type DocumentBlock, getAttribute, hasAttribute } from '../utils/prepareDocument'
import Outline from './Outline'

const Document = ({ document }: { document: DocumentBlock }) => {
  const Header = () => {
    if (!document.noHeader) {
      return (
        <div id="header">
          {document.hasHeader && (
            <>
              <h1
                dangerouslySetInnerHTML={{
                  __html: document.title,
                }}
              />

              <Details />

              {document.sections &&
                document.sections.length > 0 &&
                document.attributes['toc'] !== undefined &&
                document.attributes['toc-placement'] === 'auto' && (
                  <div
                    id="toc"
                    className={getAttribute(document.attributes, 'toc-class', 'toc')}
                  >
                    <div id="toctitle">{document.attributes['toc-title']}</div>
                    <Outline sections={document.sections} />
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
    if (!document.footnotes) return null

    if (
      document.footnotes.length > 0 &&
      document.blocks &&
      !hasAttribute(document.attributes, 'nofootnotes')
    ) {
      return (
        <div id="footnotes">
          <hr />

          {document.footnotes.map((footnote) => (
            <div
              className="footnote"
              id={`_footnotedef_${footnote.index}`}
              key={footnote.index}
            >
              <a href={`#_footnoteref_${footnote.index}`}>{footnote.index}</a>.{' '}
              {parse(footnote.text || '')}
            </div>
          ))}
        </div>
      )
    } else {
      return null
    }
  }

  const Details = () => {
    if (
      document.authors.length > 0 ||
      hasAttribute(document.attributes, 'revnumber') ||
      hasAttribute(document.attributes, 'revdate') ||
      hasAttribute(document.attributes, 'revremark')
    ) {
      return (
        <div className="details">
          {document.authors.map((author, index) => (
            <Fragment key={index}>
              {author.name && (
                <>
                  <span id={`author${index + 1 > 1 ? index + 1 : ''}`} className="author">
                    {parse(author.name)}
                  </span>
                  <br />
                </>
              )}
              {author.email && (
                <>
                  <span id={`email${index + 1 > 1 ? index + 1 : ''}`} className="email">
                    {parse(author.email)}
                  </span>
                  <br />
                </>
              )}
            </Fragment>
          ))}

          {hasAttribute(document.attributes, 'revnumber') && (
            <span id="revnumber">{`${document.attributes['version-label'].toLowerCase()} ${
              document.attributes['revnumber']
            }${document.attributes['revdate'] ? ',' : ''}`}</span>
          )}

          {hasAttribute(document.attributes, 'revdate') && (
            <span id="revdate">{document.attributes['revdate']}</span>
          )}

          {hasAttribute(document.attributes, 'revremark') && (
            <>
              <br />
              <span id="revremark">{document.attributes['revremark']}</span>
            </>
          )}
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
        <Content blocks={document.blocks} />
      </div>
      <Footnotes />
    </>
  )
}

export default Document
