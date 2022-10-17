import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

const Pass = ({ node }: { node: Asciidoctor.AbstractBlock }) => {
  return <>{parse(node.getContent())}</>
}

export default Pass
