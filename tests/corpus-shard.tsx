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

const allDocs = [...loadCorpus('rfds'), ...loadCorpus('writers-guide')]

// Vitest parallelises across test *files* (worker pool), not within a file.
// Each shard file calls this with its index so the corpus is split round-robin
// across workers, letting the suite use every core instead of one.
export const defineCorpusShard = (index: number, total: number): void => {
  const docs = allDocs.filter((_, i) => i % total === index)
  describe(`corpus parity (shard ${index + 1}/${total})`, () => {
    for (const { name, source } of docs) {
      test(name, () => {
        const stock = normalise(stockHtml(source))
        const react = normalise(reactHtml(source))
        expect(react).toBe(stock)
      })
    }
  })
}
