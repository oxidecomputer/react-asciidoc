// @ts-nocheck
import asciidoctor from '@asciidoctor/core'
import type { Extensions } from '@asciidoctor/core'
import hljs from 'highlight.js'
import { useEffect, useMemo } from 'react'
import { Fragment } from 'react'

import { Asciidoc, type Options } from './asciidoc'
import './asciidoc.css'
import { prepareDocument } from './asciidoc/utils/prepareDocument'
import * as content from './examples'
import './test.css'

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

const ad = asciidoctor()

const extensions = [ext]
extensions.forEach((extension) => ad.Extensions.register(extension))

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
            <AsciidocWrapper content={content} key={index} />
          ))
        : getContent().map((content, index) => (
            <Fragment key={index}>{renderHtml5(content)}</Fragment>
          ))}
    </div>
  )
}

const AsciidocWrapper = ({ content }: { content: string }) => {
  const doc = useMemo(
    () =>
      ad.load(content, {
        standalone: true,
        attributes: attrs,
      }),
    [content],
  )

  const preparedDoc = prepareDocument(doc)

  return <Asciidoc document={preparedDoc} />
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
