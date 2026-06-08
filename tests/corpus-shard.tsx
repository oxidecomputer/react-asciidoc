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
  const results: Doc[] = []
  const walk = (current: string, prefix: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) {
        walk(full, `${prefix}${entry.name}/`)
      } else if (entry.name.endsWith('.adoc')) {
        results.push({
          name: `${subdir}/${prefix}${entry.name}`,
          source: readFileSync(full, 'utf8'),
        })
      }
    }
  }
  walk(dir, '')
  return results.sort((a, b) => a.name.localeCompare(b.name))
}

const allDocs = [...loadCorpus('rfds'), ...loadCorpus('asciidoctor-extracted')]

// Vitest parallelises across test *files* (worker pool), not within a file.
// Each shard file calls this with its index so the corpus is split round-robin
// across workers, letting the suite use every core instead of one.
//
// Run a single doc:        npx vitest run -t "asciidoctor-extracted/tables_test"
// Run all rfds:             npx vitest run -t "rfds/"
// Run a specific subdir:   npx vitest run -t "asciidoctor-extracted/inline_test"
// Triage with grouping:    npx vite-node tests/triage.ts -- --group --summary
// Filter to pattern:        npx vite-node tests/triage.ts -- --filter "tables_test"
export const defineCorpusShard = (index: number, total: number): void => {
  const docs = allDocs.filter((_, i) => i % total === index)
  for (const { name, source } of docs) {
    test(name, () => {
      const stock = normalise(stockHtml(source))
      const react = normalise(reactHtml(source))
      expect(react).toBe(stock)
    })
  }
}
