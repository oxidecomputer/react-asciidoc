import parse from 'html-react-parser'
import { useContext } from 'react'

import { Context } from '..'
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
  const { document } = useContext(Context)

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
        let sectNum = section.num
        sectNum = sectNum === '.' || sectNum === '..' ? '' : sectNum

        const level = section.level

        let title = section.title

        if (level <= sectNumLevels) {
          // todo: investigate sectnumlevels overrides not working
          title = `${sectNum} ${section.title}`
        }

        return (
          <li key={section.id}>
            <a href={`#${section.id}`}>{parse(title)}</a>
            {level < tocLevels && (
              <Outline
                sections={section.sections}
                opts={{
                  tocLevels,
                  sectNumLevels,
                }}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default Outline
