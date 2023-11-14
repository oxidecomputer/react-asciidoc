import type { Block } from '@asciidoctor/core'
import cn from 'classnames'

// import hljs from 'highlight.js'
import { getContent } from '../utils/getContent'
import { CaptionedTitle, getLineNumber } from './util'

// <code
//   className={lang ? `language-${lang}` : ''}
//   data-lang={lang}
//   dangerouslySetInnerHTML={{
//     __html: hljs.getLanguage(lang)
//       ? hljs.highlight(content, { language: lang }).value
//       : content,
//   }}
// />

const Listing = ({ node }: { node: Block }) => {
  const document = node.getDocument()
  const attrs = node.getAttributes()
  const nowrap = node.isOption('nowrap') || !document.hasAttribute('prewrap')
  const content = getContent(node)

  if (node.getStyle() === 'source') {
    const lang = attrs.language

    return (
      <div className="listingblock" {...getLineNumber(node)}>
        <CaptionedTitle node={node} />
        <div className="content">
          <pre className={cn('highlight', nowrap ? ' nowrap' : '')}>
            {lang ? (
              <code
                className={lang ? `language-${lang}` : ''}
                data-lang={lang}
                dangerouslySetInnerHTML={{
                  __html: content,
                }}
              />
            ) : (
              <code dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </pre>
        </div>
      </div>
    )
  } else {
    return (
      <div className="listingblock" {...getLineNumber(node)}>
        <CaptionedTitle node={node} />
        <div className="content">
          <pre className={nowrap ? ' nowrap' : ''}>
            <code dangerouslySetInnerHTML={{ __html: node.getSource() }} />
          </pre>
        </div>
      </div>
    )
  }
}

export default Listing
