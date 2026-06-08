import cn from 'classnames'

import { Title, useConverterContext } from '..'
import { type LiteralBlock, isOption } from '../utils/prepareDocument'

const Listing = ({ node }: { node: LiteralBlock }) => {
  const { document } = useConverterContext()

  const docAttrs = document.attributes || {}
  const nowrap = isOption(node.attributes, 'nowrap') || docAttrs['prewrap'] === undefined
  const wrapperClass = cn('listingblock', node.role)

  if (node.style === 'source') {
    const lang = node.language

    return (
      <div
        id={node.id || undefined}
        className={wrapperClass}
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <Title text={node.title} />
        <div className="content">
          <pre className={cn('highlight', nowrap && 'nowrap') || undefined}>
            {lang ? (
              <code
                className={`language-${lang}`}
                data-lang={lang}
                dangerouslySetInnerHTML={{ __html: node.content || '' }}
              />
            ) : (
              <code dangerouslySetInnerHTML={{ __html: node.content || '' }} />
            )}
          </pre>
        </div>
      </div>
    )
  }

  // Regular listing blocks are wrapped only in a `pre` tag
  return (
    <div
      id={node.id || undefined}
      className={wrapperClass}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <div className="content">
        <pre
          className={cn(nowrap && 'nowrap') || undefined}
          dangerouslySetInnerHTML={{ __html: node.content || '' }}
        />
      </div>
    </div>
  )
}

export default Listing
