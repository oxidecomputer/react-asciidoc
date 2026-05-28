import cn from 'classnames'

import { type AudioBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Audio = ({ node }: { node: AudioBlock }) => {
  const startTime = node.attributes.start
  const endTime = node.attributes.end
  const timeAnchor =
    startTime || endTime ? `#t=${startTime || ''}${endTime ? ',' + endTime : ''}` : ''

  const audioAttrs = [
    node.autoplay ? 'autoplay' : '',
    !node.noControls ? 'controls' : '',
    node.loop ? 'loop' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const audioOpen = `<audio src="${node.mediaUri}${timeAnchor}"${audioAttrs ? ' ' + audioAttrs : ''}>`
  const audioInner = audioOpen + 'Your browser does not support the audio tag.</audio>'

  return (
    <div
      id={node.id || undefined}
      className={cn('audioblock', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <div className="content" dangerouslySetInnerHTML={{ __html: audioInner }} />
    </div>
  )
}

export default Audio
