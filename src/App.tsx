import AsciidocProcessor from 'asciidoctor'

import Asciidoc from './asciidoc'
import './asciidoc.css'
import * as content from './examples'
import './test.css'

function App() {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  const example = urlParams.get('example')
  const renderer = urlParams.get('renderer') || 'react'

  return (
    <div className="App">
      {renderer === 'react' ? (
        <Asciidoc content={content[example]} />
      ) : (
        example && renderHtml5(content[example])
      )}
    </div>
  )
}

const renderHtml5 = (content: string) => {
  const ad = AsciidocProcessor()

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
