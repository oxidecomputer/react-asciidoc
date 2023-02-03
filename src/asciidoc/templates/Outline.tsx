import type { AbstractBlock } from '@asciidoctor/core'
import parse from 'html-react-parser'
import { useMemo } from 'react'

const Outline = ({
  node,
  opts,
}: {
  node: AbstractBlock
  opts?: {
    tocLevels?: number
    sectNumLevels?: number
  }
}) => {
  if (!node.hasSections()) return null

  const sections = node.getSections()
  const document = node.getDocument()
  const docAttrs = useMemo(() => document.getAttributes(), [node])

  const sectNumLevelsAttr = useMemo(() => document.getAttribute('sectnumlevels'), [node])
  const tocLevelsAttr = useMemo(() => document.getAttribute('toclevels'), [node])

  const sectNumLevels =
    opts?.sectNumLevels || (sectNumLevelsAttr ? parseInt(sectNumLevelsAttr) : 3)
  const tocLevels = opts?.tocLevels || (tocLevelsAttr ? parseInt(tocLevelsAttr) : 2)

  return (
    <ul className={`sectlevel${sections[0].getLevel()}`}>
      {sections.map((section) => {
        // @ts-ignore
        // Swap with getSectionNumeral() when it is released
        let sectNum = section.$sectnum()
        sectNum = sectNum === '.' || sectNum === '..' ? '' : sectNum

        const level = section.getLevel()

        let title = ''
        if (section.getCaption()) {
          title = section.getCaptionedTitle()
        } else if (level <= sectNumLevels) {
          // todo: investigate sectnumlevels overrides not working
          if (level < 2 && document.getDoctype() == 'book') {
            const sectionName = section.getSectionName()
            if (sectionName === 'chapter') {
              const signifier = docAttrs['chapter-signifier']
              title = `${signifier || ''} ${sectNum} ${section.getTitle()}`
            } else if (sectionName === 'part') {
              const signifier = docAttrs['part-signifier']
              title = `${signifier || ''} ${sectNum} ${section.getTitle()}`
            } else {
              title = `${sectNum} ${section.getTitle()}`
            }
          } else {
            title = `${sectNum} ${section.getTitle()}`
          }
        } else {
          title = section.getTitle() || ''
        }

        return (
          <li key={section.getId()}>
            <a href={`#${section.getId()}`}>{parse(title)}</a>
            {level < tocLevels && (
              <Outline
                node={section as AbstractBlock}
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
