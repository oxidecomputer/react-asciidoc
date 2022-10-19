import type { Asciidoctor } from '@asciidoctor/core'

import { ad } from './'

class InlineConverter {
  baseConverter: Asciidoctor.Html5Converter

  constructor() {
    this.baseConverter = new ad.Html5Converter()
  }

  convert(node: Asciidoctor.Block, transform: string) {
    switch (node.getNodeName()) {
      default:
        break
    }

    return this.baseConverter.convert(node, transform)
  }
}

export default InlineConverter
