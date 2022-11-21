import { useEffect, useRef, useState } from 'react'

import type { Asciidoctor } from '~/lib/asciidoctor'

const useGetContent = (
  node: Asciidoctor.Block | Asciidoctor.AbstractBlock | Asciidoctor.Table.Cell,
) => {
  const getContentRef = useRef(false)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (getContentRef.current) return
    getContentRef.current = true
    setContent(node.getContent())
  }, [node])

  return content
}

export default useGetContent
