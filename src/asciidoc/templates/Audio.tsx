import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

const Audio = ({ node }: { node: Asciidoctor.Block }) => {
  const startTime = node.getAttribute('start')
  const endTime = node.getAttribute('start')
  const timeAnchor =
    startTime || endTime ? (`#t=${startTime || ''}` + endTime ? `,${endTime}` : '') : ''

  const title = node.hasTitle() && (
    <div className="title">{parse(node.getCaptionedTitle())}</div>
  )

  return (
    <div className="audioblock">
      {title}
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
