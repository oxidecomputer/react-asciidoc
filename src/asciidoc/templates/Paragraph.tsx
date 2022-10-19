import type { Asciidoctor } from 'asciidoctor'
import cn from 'classnames'
import { useEffect, useRef, useState } from 'react'

import { Title, getRole } from './util'

const Paragraph = ({ node }: { node: Asciidoctor.Block }) => {
  const getContentRef = useRef(false)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (getContentRef.current) return
    getContentRef.current = true
    setContent(node.getContent())
  }, [node])

  return (
    <div id={node.getId ? node.getId() : ''} className={cn('paragraph', getRole(node))}>
      <Title node={node} />
      <p dangerouslySetInnerHTML={{ __html: content || '' }} />
    </div>
  )
}

export default Paragraph
