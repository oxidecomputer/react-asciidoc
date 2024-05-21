import cn from 'classnames'
import parse from 'html-react-parser'
import { useContext } from 'react'

import { Context } from '..'
import { Block } from '../utils/prepareDocument'
import Outline from './Outline'

const TableOfContents = ({ node }: { node: Block }) => {
  const { document } = useContext(Context)
  const docAttrs = document.attributes || {}

  const hasSections = document.sections && document.sections.length > 0

  let idAttr: string = node.id || 'toc'
  const title = node.title ? node.title : docAttrs['toc-title']

  const tocPlacement = docAttrs['toc-placement']
  const hasToc = docAttrs['toc'] !== undefined

  const levels = node.attributes['levels']
    ? parseInt(`${node.attributes['levels']}`)
    : undefined

  if (tocPlacement === 'macro' && hasSections && hasToc) {
    return (
      <div id={idAttr} className={cn('toc', node.role)}>
        <div id={`${idAttr}title`} className="title">
          {parse(`${title}` || '')}
        </div>
        {document.sections && (
          <Outline sections={document.sections} opts={{ tocLevels: levels }} />
        )}
      </div>
    )
  } else {
    return null
  }
}

export default TableOfContents
