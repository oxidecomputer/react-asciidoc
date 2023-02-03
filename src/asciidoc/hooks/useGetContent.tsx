import type { AbstractBlock, Block, Table } from '@asciidoctor/core'
import { useEffect, useRef, useState } from 'react'

const useGetContent = (node: Block | AbstractBlock | Table.Cell) => {
  const getContentRef = useRef(false)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (getContentRef.current) return
    getContentRef.current = true
    setContent(node.getContent() || '')
  }, [node])

  return content
}

export default useGetContent
