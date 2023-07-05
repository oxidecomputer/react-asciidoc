import type { Block } from '@asciidoctor/core'

import { Title, getLineNumber } from './util'

const Audio = ({ node }: { node: Block }) => {
  const startTime = node.getAttribute('start')
  const endTime = node.getAttribute('start')
  const timeAnchor =
    startTime || endTime ? (`#t=${startTime || ''}` + endTime ? `,${endTime}` : '') : ''

  return (
    <div className="audioblock" {...getLineNumber(node)}>
      <Title node={node} />
      <div className="content">
        <audio
          src={`${node.getMediaUri(node.getAttribute('target'))}${timeAnchor}`}
          autoPlay={node.isOption('autoplay')}
          controls={!node.isOption('nocontrols')}
          loop={node.isOption('loop')}
        >
          Your browser does not support the audio tag.
        </audio>
      </div>
    </div>
  )
}
export default Audio
