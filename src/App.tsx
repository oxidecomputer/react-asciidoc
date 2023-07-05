// @ts-nocheck
import type { Extensions } from '@asciidoctor/core'
import hljs from 'highlight.js'
import { useEffect } from 'react'
import { Fragment } from 'react'

import Asciidoc, { type Options, asciidoctor } from './asciidoc'
import './asciidoc.css'
import * as content from './examples'
import './test.css'

const opts: Options = {}
const attrs = {
  sectlinks: 'true',
  icons: 'font',
  stem: 'latexmath',
  stylesheet: false,
}

const ext = function (this: Extensions.Registry) {
  this.inlineMacro('emoticon', function () {
    this.process(function (parent, target) {
      let text = ''
      if (target === 'grin') {
        text = ':D'
      } else if (target === 'wink') {
        text = ';)'
      } else {
        text = ':)'
      }
      return this.createInline(parent, 'quoted', text, { type: 'strong' })
    })
  })
}

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
  const ad = asciidoctor()

  const extensions = [ext]
  extensions.forEach((extension) => ad.Extensions.register(extension))

  ad.SyntaxHighlighter.register('highlight.js-server', {
    handlesHighlighting: () => true,
    highlight: (_node, source, lang) => {
      if (!lang) return source
      return hljs.getLanguage(lang)
        ? hljs.highlight(source, { language: lang }).value
        : source
    },
  })

  return (
    <div className="App">
      {renderer === 'react'
        ? getContent().map((content, index) => (
            <Asciidoc
              key={index}
              content={ad.load(content, {
                standalone: true,
                attributes: attrs,
              })}
              options={opts}
            />
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
    attributes: attrs,
  })

  return <div dangerouslySetInnerHTML={{ __html: document.convert() }} />
}

export default App
