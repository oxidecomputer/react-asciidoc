import asciidoctor from '@asciidoctor/core'
import { useEffect } from 'react'
import { Fragment } from 'react'

import Asciidoc, { AdocTypes, Title, getRole, useGetContent } from './asciidoc'
import './asciidoc.css'
import * as content from './examples'
import './test.css'

// const CustomParagraph = ({ node }: { node: AdocTypes.Block }) => {
//   const content = useGetContent(node)
//
//   return (
//     <div
//       id={node.getId ? node.getId() : ''}
//       className={`custom-paragraph paragraph ${getRole(node) || ''}`}
//     >
//       <Title node={node} />
//       <p dangerouslySetInnerHTML={{ __html: content }} />
//     </div>
//   )
// }
//
// const CustomDocument = ({ document }: { document: AdocTypes.Document }) => {
//   console.log(document)
//   return <div>Hello</div>
// }
//
// const opts = {
//   overrides: {
//     paragraph: CustomParagraph,
//   },
//   customDocument: CustomDocument,
// }
const opts = {}

function App() {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  const example = urlParams.get('example') || ''
  const renderer = urlParams.get('renderer') || 'react'

  useEffect(() => {
    document.title = `${example} / ${renderer}`
  }, [example, renderer])

  const getContent = (): string[] => {
    // @ts-ignore
    let input: string | string[] = content[example]

    if (!Array.isArray(input)) {
      input = [input]
    }

    return input
  }

  getContent()

  return (
    <div className="App">
      {renderer === 'react'
        ? getContent().map((content, index) => (
            <Asciidoc key={index} content={content} options={opts} />
          ))
        : getContent().map((content, index) => (
            <Fragment key={index}>{renderHtml5(content)}</Fragment>
          ))}
    </div>
  )
}

const renderHtml5 = (content: string) => {
  const ad = asciidoctor()
  const document = ad.load(content, {
    standalone: true,
    attributes: {
      'source-highlighter': 'highlight.js-server',
      sectlinks: 'true',
      icons: 'font',
      stem: 'latexmath',
      stylesheet: false,
    },
  })

  return <div dangerouslySetInnerHTML={{ __html: document.convert() }} />
}

export default App
