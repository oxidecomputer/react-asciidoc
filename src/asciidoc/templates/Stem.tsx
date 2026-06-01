import cn from 'classnames'

import { useConverterContext } from '..'
import { type Block } from '../utils/prepareDocument'
import { Title } from './util'

const Stem = ({ node }: { node: Block }) => {
  const { document } = useConverterContext()
  const docAttrs = document.attributes || {}

  const docStem = (docAttrs['stem'] as string) || 'asciimath'
  let style = (node.style as string | undefined) || docStem
  // A bare `[stem]` block resolves to the document's configured stem flavour.
  if (style === 'stem') style = docStem === 'latexmath' ? 'latexmath' : 'asciimath'

  // Stem blocks wrap their content in either AsciiMath (\$…\$) or LaTeX
  // (\[…\]) delimiters depending on the configured stem style.
  const [open, close] =
    style === 'latexmath'
      ? ['\\[', '\\]']
      : style === 'asciimath'
        ? ['\\$', '\\$']
        : ['', '']

  let wrapped = Array.isArray(node.content) ? node.content.join('\n') : node.content || ''
  if (open) {
    // AsciiMath blocks split on blank lines / explicit line continuations into
    // separate display equations joined by <br>, mirroring StemBreakRx.
    if (style === 'asciimath' && wrapped.indexOf('\n') !== -1) {
      wrapped = wrapped.replace(/ *\\\n(?:\\?\n)*|\n\n+/g, (m) => {
        const breaks = (m.match(/\n/g) || []).length
        return close + '\n<br>'.repeat(breaks - 1) + '\n' + open
      })
    }
    // Don't double-wrap content that already carries the delimiters.
    if (!(wrapped.startsWith(open) && wrapped.endsWith(close))) {
      wrapped = `${open}${wrapped}${close}`
    }
  }

  return (
    <div
      id={node.id || undefined}
      className={cn('stemblock', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <div className="content" dangerouslySetInnerHTML={{ __html: wrapped }} />
    </div>
  )
}

export default Stem
