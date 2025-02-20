import { type VideoBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Video = ({ node }: { node: VideoBlock }) => {
  const startTime = node.attributes.start
  const endTime = node.attributes.end
  const timeAnchor =
    startTime || endTime ? (`#t=${startTime || ''}` + endTime ? `,${endTime}` : '') : ''

  return (
    <div
      className="videoblock"
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <div className="content">
        <video
          src={`${node.mediaUri}${timeAnchor}`}
          autoPlay={node.autoplay}
          controls={!node.noControls}
          loop={node.loop}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}
export default Video
