import { useConverterContext } from '..'
import { type DocumentSection } from '../utils/prepareDocument'

const Outline = ({
  sections,
  opts,
}: {
  sections: DocumentSection[]
  opts?: {
    tocLevels?: number
    sectNumLevels?: number
  }
}) => {
  const { document } = useConverterContext()

  if (!sections || sections.length === 0) return null

  const docAttrs = document.attributes || {}

  const sectNumLevelsAttr = docAttrs['sectnumlevels']
  const tocLevelsAttr = docAttrs['toclevels']

  const sectNumLevels =
    opts?.sectNumLevels || (sectNumLevelsAttr ? parseInt(`${sectNumLevelsAttr}`) : 3)
  const tocLevels = opts?.tocLevels || (tocLevelsAttr ? parseInt(`${tocLevelsAttr}`) : 2)

  // Asciidoctor's `convert_outline` drops anchor tags from TOC entry text
  // (a TOC entry is itself an `<a>`, so nested links/anchors are stripped).
  // Mirrors `stitle.gsub(DropAnchorRx, '')` with `DropAnchorRx`.
  const dropAnchors = (html: string): string =>
    html.includes('<a') ? html.replace(/<(?:a\b[^>]*|\/a)>/g, '') : html

  return (
    <ul className={`sectlevel${sections[0].level}`}>
      {sections.map((section) => {
        const numeric =
          section.numbered &&
          section.num &&
          section.num !== '.' &&
          section.num !== '..' &&
          !section.num.startsWith('.') &&
          !section.hasCaption
        const title =
          numeric && section.level <= sectNumLevels
            ? `${section.num} ${section.title}`
            : section.title

        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              dangerouslySetInnerHTML={{ __html: dropAnchors(title) }}
            />
            {section.level < tocLevels && section.sections.length > 0 && (
              <Outline sections={section.sections} opts={{ tocLevels, sectNumLevels }} />
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default Outline
