import type { AbstractBlock } from '@asciidoctor/core'
import parse from 'html-react-parser'

import { getContent } from '../utils/getContent'

const Pass = ({ node }: { node: AbstractBlock }) => {
  const content = getContent(node)

  return <>{parse(content)}</>
}

export default Pass
