import cn from 'classnames'
import { useContext } from 'react'

import { Context } from '..'
import { LiteralBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Listing = ({ node }: { node: LiteralBlock }) => {
  const { document } = useContext(Context)

  const nowrap = node.attributes.nowrap || document.attributes!['prewrap']

  if (node.style === 'source') {
    const lang = node.language

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
                  __html: node.content || '',
                }}
              />
            ) : (
              <code dangerouslySetInnerHTML={{ __html: node.content || '' }} />
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
