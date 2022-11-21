import parse from 'html-react-parser'

import type { Asciidoctor } from '~/lib/asciidoctor'

import useGetContent from '../hooks/useGetContent'

const Pass = ({ node }: { node: Asciidoctor.AbstractBlock }) => {
  const content = useGetContent(node)

  return <>{parse(content)}</>
}

export default Pass
