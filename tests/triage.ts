// Run with: npx tsx tests/triage.ts
// Walks every corpus document, computes the stock/react diff, and prints
// the first divergent characters of each failure so a glance can group
// failures by template/feature.
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { normalise, reactHtml, stockHtml } from './helpers'

const CORPUS_ROOT = join(dirname(fileURLToPath(import.meta.url)), 'corpus')

const load = (subdir: string) => {
  const dir = join(CORPUS_ROOT, subdir)
  return readdirSync(dir)
    .filter((f) => f.endsWith('.adoc'))
    .sort()
    .map((f) => ({ name: `${subdir}/${f}`, src: readFileSync(join(dir, f), 'utf8') }))
}

const docs = [...load('rfds'), ...load('writers-guide')]

let pass = 0
const fails: Array<{ name: string; pos: number; e: string; r: string }> = []

for (const { name, src } of docs) {
  let stock: string
  let react: string
  try {
    stock = normalise(stockHtml(src))
    react = normalise(reactHtml(src))
  } catch (err) {
    fails.push({ name, pos: -1, e: 'THREW: ' + (err as Error).message, r: '' })
    continue
  }
  if (stock === react) {
    pass++
    continue
  }
  let i = 0
  while (i < Math.min(stock.length, react.length) && stock[i] === react[i]) i++
  fails.push({
    name,
    pos: i,
    e: stock.slice(Math.max(0, i - 40), i + 80),
    r: react.slice(Math.max(0, i - 40), i + 80),
  })
}

console.log(`pass: ${pass}/${docs.length}`)
console.log(`fail: ${fails.length}`)
console.log()
for (const f of fails) {
  console.log(`--- ${f.name} (at ${f.pos}) ---`)
  console.log(`  E: ${JSON.stringify(f.e)}`)
  console.log(`  R: ${JSON.stringify(f.r)}`)
}
