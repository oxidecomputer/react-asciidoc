import { type AudioBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Audio = ({ node }: { node: AudioBlock }) => {
  const startTime = node.attributes.start
  const endTime = node.attributes.end
  const timeAnchor =
    startTime || endTime ? (`#t=${startTime || ''}` + endTime ? `,${endTime}` : '') : ''

  return (
    <div
      className="audioblock"
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <div className="content">
        <audio
          src={`${node.mediaUri}${timeAnchor}`}
          autoPlay={node.autoplay}
          controls={!node.noControls}
          loop={node.loop}
        >
          Your browser does not support the audio tag.
        </audio>
      </div>
    </div>
  )
}
export default Audio
