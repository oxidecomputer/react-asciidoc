import cn from 'classnames'

import { type VideoBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Video = ({ node }: { node: VideoBlock }) => {
  const startTime = node.attributes.start
  const endTime = node.attributes.end
  const timeAnchor =
    startTime || endTime ? `#t=${startTime || ''}${endTime ? ',' + endTime : ''}` : ''
  const width = node.attributes.width
  const height = node.attributes.height
  const poster = node.attributes.poster

  const attrs: string[] = [`src="${node.mediaUri}${timeAnchor}"`]
  if (width) attrs.push(`width="${width}"`)
  if (height) attrs.push(`height="${height}"`)
  if (poster) attrs.push(`poster="${poster}"`)
  if (node.autoplay) attrs.push('autoplay')
  if (!node.noControls) attrs.push('controls')
  if (node.loop) attrs.push('loop')

  const videoHtml = `<video ${attrs.join(' ')}>\nYour browser does not support the video tag.\n</video>`

  return (
    <div
      id={node.id || undefined}
      className={cn('videoblock', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <div className="content" dangerouslySetInnerHTML={{ __html: videoHtml }} />
    </div>
  )
}

export default Video
