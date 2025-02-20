import cn from 'classnames'

import { Title, useConverterContext } from '..'
import { type LiteralBlock } from '../utils/prepareDocument'

const Listing = ({ node }: { node: LiteralBlock }) => {
  const { document } = useConverterContext()

  const docAttrs = document.attributes || {}
  const nowrap = node.attributes.nowrap || docAttrs['prewrap'] === undefined

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
    // Regular listing blocks are wrapped only in a `pre` tag
    return (
      <div
        className="listingblock"
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <Title text={node.title} />
        <div className="content">
          <pre
            className={cn('highlight !block', nowrap ? 'nowrap' : '')}
            dangerouslySetInnerHTML={{
              __html: node.content || '',
            }}
          />
        </div>
      </div>
    )
  }
}

export default Listing
