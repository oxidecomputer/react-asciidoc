import parse from 'html-react-parser'

import { Block } from '../utils/prepareDocument'

const Pass = ({ node }: { node: Block }) => {
  return <>{parse(node.content || '')}</>
}

export default Pass
