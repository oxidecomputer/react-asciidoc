import cn from 'classnames'
import { decode } from 'html-entities'
import { useContext } from 'react'

import { Context } from '..'
import { type LiteralBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Listing = ({ node }: { node: LiteralBlock }) => {
  const { document, highlighter } = useContext(Context)

  const nowrap = node.attributes.nowrap || document.attributes!['prewrap']

  if (node.style === 'source') {
    const lang = node.language
    const content = node.content || ''
    const decodedContent = decode(content) || content // unescape the html entities

    return (
      <div
        className="listingblock"
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <Title text={node.title} />
        <div className="content">
          <pre className={cn('highlight', nowrap ? ' nowrap' : '')}>
            {lang ? (
              <code
                className={lang ? `language-${lang}` : ''}
                data-lang={lang}
                dangerouslySetInnerHTML={{
                  __html: highlighter ? highlighter(lang, decodedContent) : decodedContent,
                }}
              />
            ) : (
              <code dangerouslySetInnerHTML={{ __html: decodedContent }} />
            )}
          </pre>
        </div>
      </div>
    )
  } else {
    return (
      <div
        className="listingblock"
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <Title text={node.title} />
        <div className="content">
          <pre className={nowrap ? ' nowrap' : ''}>
            <code dangerouslySetInnerHTML={{ __html: node.source }} />
          </pre>
        </div>
      </div>
    )
  }
}

export default Listing
