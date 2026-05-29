import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

import { normalise, reactHtml, stockHtml } from './helpers'

const CORPUS_ROOT = join(dirname(fileURLToPath(import.meta.url)), 'corpus')

interface Doc {
  name: string
  source: string
}

const loadCorpus = (subdir: string): Doc[] => {
  const dir = join(CORPUS_ROOT, subdir)
  return readdirSync(dir)
    .filter((f) => f.endsWith('.adoc'))
    .sort()
    .map((f) => ({ name: `${subdir}/${f}`, source: readFileSync(join(dir, f), 'utf8') }))
}

const docs = [...loadCorpus('rfds'), ...loadCorpus('writers-guide')]

describe('corpus parity', () => {
  for (const { name, source } of docs) {
    test(name, () => {
      const stock = normalise(stockHtml(source))
      const react = normalise(reactHtml(source))
      expect(react).toBe(stock)
    })
  }
})
