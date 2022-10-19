import type { Asciidoctor } from 'asciidoctor'
import cn from 'classnames'
import parse from 'html-react-parser'
import { useMemo } from 'react'

import Outline from './Outline'
import { getRole } from './util'

const TableOfContents = ({ node }: { node: Asciidoctor.Block }) => {
  let idAttr: string = node.getId() || 'toc'
  const document = node.getDocument()
  const title = node.hasTitle() ? node.getTitle() : document.getAttribute('toc-title')

  const tocPlacement = useMemo(() => document.getAttribute('toc-placement'), [node])
  const hasToc = useMemo(() => document.hasAttribute('toc'), [node])

  const levels = node.hasAttribute('levels')
    ? parseInt(node.getAttribute('levels'))
    : undefined

  if (tocPlacement === 'macro' && document.hasSections() && hasToc) {
    return (
      <div id={idAttr} className={cn('toc', getRole(node))}>
        <div id={`${idAttr}title`} className="title">
          {parse(title || '')}
        </div>
        <Outline
          node={node.getDocument() as Asciidoctor.AbstractBlock}
          opts={{ tocLevels: levels }}
        />
      </div>
    )
  } else {
    return null
  }
}

export default TableOfContents
