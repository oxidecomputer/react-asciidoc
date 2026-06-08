import { describe, expect, test } from 'vitest'

import * as examples from '../src/examples'
import { normalise, reactHtml, stockHtml } from './helpers'

const SOURCES: Array<[string, string]> = []
for (const [name, value] of Object.entries(examples)) {
  if (Array.isArray(value)) {
    value.forEach((snippet, i) => SOURCES.push([name + '[' + i + ']', snippet as string]))
  } else if (typeof value === 'string') {
    SOURCES.push([name, value])
  }
}

describe('renderer parity', () => {
  for (const [name, source] of SOURCES) {
    test(name, () => {
      const stock = normalise(stockHtml(source))
      const react = normalise(reactHtml(source))
      expect(react).toBe(stock)
    })
  }
})
