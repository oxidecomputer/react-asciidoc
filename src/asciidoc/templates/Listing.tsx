import cn from 'classnames'

import type { Asciidoctor } from '~/lib/asciidoctor'

import useGetContent from '../hooks/useGetContent'
import { CaptionedTitle } from './util'

const Listing = ({ node }: { node: Asciidoctor.Block }) => {
  const document = node.getDocument()
  const attrs = node.getAttributes()
  const nowrap = node.isOption('nowrap') || !document.hasAttribute('prewrap')
  const content = useGetContent(node)

  if (node.getStyle() === 'source') {
    const lang = attrs.language

    return (
      <div className="listingblock">
        <CaptionedTitle node={node} />
        <div className="content">
          <pre className={cn('highlight', nowrap ? ' nowrap' : '')}>
            {lang ? (
              <code
                className={lang ? `language-${lang}` : ''}
                data-lang={lang}
                dangerouslySetInnerHTML={{ __html: content }}
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
      <div className="listingblock">
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
