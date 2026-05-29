import cn from 'classnames'

import { type ImageBlock } from '../utils/prepareDocument'
import { Title } from './util'

// Attribute escaping that preserves entity references already present in the
// substituted alt text (e.g. `&#8217;` must not become `&amp;#8217;`).
const VALID_ENTITY_TAIL = /^(?:[a-zA-Z][a-zA-Z]+\d{0,2}|#\d{1,7}|#x[\da-fA-F]{1,6});/
const escapeAttr = (str: string): string => {
  let out = ''
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === '&') out += VALID_ENTITY_TAIL.test(str.slice(i + 1)) ? '&' : '&amp;'
    else if (ch === '"') out += '&quot;'
    else if (ch === '<') out += '&lt;'
    else if (ch === '>') out += '&gt;'
    else out += ch
  }
  return out
}

const Image = ({ node }: { node: ImageBlock }) => {
  // `node.alt` is asciidoctor's substituted alt (entities applied). Build the
  // <img> as an HTML string so React doesn't re-escape `&` in those entities.
  const alt = node.alt ?? node.attributes['alt']?.toString() ?? ''
  const width = node.attributes['width']
  const height = node.attributes['height']
  const link = node.attributes['link']
  const align = node.attributes['align']
  const float = node.attributes['float']

  let imgHtml = `<img src="${escapeAttr(node.imageUri)}" alt="${escapeAttr(alt)}"`
  if (width) imgHtml += ` width="${escapeAttr(width.toString())}"`
  if (height) imgHtml += ` height="${escapeAttr(height.toString())}"`
  imgHtml += '>'

  if (link) {
    imgHtml = `<a class="image" href="${escapeAttr(link.toString())}">${imgHtml}</a>`
  }

  return (
    <div
      id={node.id || undefined}
      className={cn(
        'imageblock',
        align ? 'text-' + align : undefined,
        float || undefined,
        node.role,
      )}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <div className="content" dangerouslySetInnerHTML={{ __html: imgHtml }} />
      <Title text={node.title} />
    </div>
  )
}

export default Image
