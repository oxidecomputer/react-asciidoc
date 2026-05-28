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

  return (
    <ul className={`sectlevel${sections[0].level}`}>
      {sections.map((section) => {
        const numeric =
          section.num && section.num !== '.' && section.num !== '..' && !section.num.startsWith('.')
        const title =
          numeric && section.level <= sectNumLevels
            ? `${section.num} ${section.title}`
            : section.title

        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              dangerouslySetInnerHTML={{ __html: title }}
            />
            {section.level < tocLevels && section.sections.length > 0 && (
              <Outline
                sections={section.sections}
                opts={{ tocLevels, sectNumLevels }}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default Outline
