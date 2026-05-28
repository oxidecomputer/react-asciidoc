import cn from 'classnames'

import { useConverterContext } from '..'
import { type Block } from '../utils/prepareDocument'
import { Title } from './util'

const Stem = ({ node }: { node: Block }) => {
  const { document } = useConverterContext()
  const docAttrs = document.attributes || {}

  const style =
    (node.style as string | undefined) || (docAttrs['stem'] as string) || 'asciimath'
  const equation = node.content || ''
  // Stem blocks wrap their content in either AsciiMath (\$…\$) or LaTeX
  // (\[…\]) delimiters depending on the configured stem style.
  const wrapped =
    style === 'latexmath'
      ? `\\[${equation}\\]`
      : style === 'asciimath' || style === 'stem'
        ? `\\$${equation}\\$`
        : equation

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
