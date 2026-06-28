// Run with: npx vite-node tests/measure-size.ts
//
// Quantifies the serialized-AST size that `prepareDocument` produces. The
// parity suite (corpus.*.test.tsx / triage.ts) proves *correctness*; this
// proves *size*. For each corpus doc it does:
//   loadAsciidoctor -> prepareDocument -> JSON.stringify -> byte count
// and prints (1) aggregate corpus AST bytes + ratio to source, (2) a
// deterministic synthetic table-heavy doc (the per-cell-duplication pathology,
// generated in-memory — no committed fixture), (3) a per-key breakdown of
// cumulative serialized bytes so dropped fields show as zero.
//
// Run on `main` and on the branch and compare the numbers.
//
// Options:
//   --filter <str>   Only measure docs whose name contains <str>
//   --top <n>        Show the top <n> keys (default 25)
import asciidoctor from '@asciidoctor/core'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { prepareDocument } from '../src/asciidoc'
import type { DocumentBlock } from '../src/asciidoc/utils/prepareDocument'
import { DEFAULT_ATTRS } from './helpers'

const ROOT = dirname(fileURLToPath(import.meta.url))
const CORPUS_ROOT = join(ROOT, 'corpus')

// Deterministic synthetic table-heavy document. The per-cell duplication that
// dominated the docs app's serialized AST lives in big tables; this reproduces
// that pathology in-memory so the extreme-case number is measurable from the
// repo alone — no committed fixture. (The real-world instance is the docs app's
// generated `metrics/timeseries-schemas` page; regenerate it there if you want
// the exact figure.) Defaults ≈ the docs page's ~13k cells.
const makeTableHeavyDoc = (tables = 200, rows = 12, cols = 5): string => {
  const parts = ['= Synthetic table-heavy doc', ':showtitle:', '']
  for (let t = 0; t < tables; t++) {
    parts.push(
      `== Schema ${t}`,
      '',
      `.Table ${t}`,
      `[cols="${'1,'.repeat(cols - 1)}1",options="header"]`,
      '|===',
    )
    parts.push(Array.from({ length: cols }, (_, c) => `| Column ${c}`).join(' '))
    for (let r = 0; r < rows; r++)
      parts.push(
        Array.from(
          { length: cols },
          (_, c) => `| field_${r}_${c} value with a few words`,
        ).join(' '),
      )
    parts.push('|===', '')
  }
  return parts.join('\n')
}

const ad = asciidoctor()

const args = process.argv.slice(2)
const filterArg = args.indexOf('--filter')
const filter = filterArg >= 0 ? args[filterArg + 1] : undefined
const topArg = args.indexOf('--top')
const top = topArg >= 0 ? Number(args[topArg + 1]) : 25

type Doc = { name: string; src: string }

const load = (subdir: string): Doc[] => {
  const dir = join(CORPUS_ROOT, subdir)
  if (!existsSync(dir)) return []
  const out: Doc[] = []
  const walk = (current: string, prefix: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) walk(full, `${prefix}${entry.name}/`)
      else if (entry.name.endsWith('.adoc'))
        out.push({
          name: `${subdir}/${prefix}${entry.name}`,
          src: readFileSync(full, 'utf8'),
        })
    }
  }
  walk(dir, '')
  return out.sort((a, b) => a.name.localeCompare(b.name))
}

const prepare = (src: string): DocumentBlock => {
  const doc = ad.load(src, { attributes: DEFAULT_ATTRS, standalone: true })
  return prepareDocument(doc) as DocumentBlock
}

const utf8 = (s: string) => Buffer.byteLength(s, 'utf8')

// Cumulative serialized bytes attributed to each property name: for every
// object property we add the byte length of its JSON-serialized value (the
// cost that would vanish if the key were dropped). Keys nested under the same
// name across the whole tree accumulate together.
const sizeByKey = (value: unknown, acc: Map<string, number>): void => {
  if (Array.isArray(value)) {
    for (const v of value) sizeByKey(v, acc)
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      const js = JSON.stringify(v)
      if (js === undefined) continue // undefined / function / symbol — dropped by stringify
      acc.set(k, (acc.get(k) ?? 0) + utf8(js))
      sizeByKey(v, acc)
    }
  }
}

const fmtBytes = (n: number): string => {
  if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + ' MB'
  if (n >= 1024) return (n / 1024).toFixed(1) + ' KB'
  return n + ' B'
}

const measure = (docs: Doc[]) => {
  let srcBytes = 0
  let astBytes = 0
  const keyBytes = new Map<string, number>()
  for (const { src } of docs) {
    srcBytes += utf8(src)
    const prepared = prepare(src)
    const json = JSON.stringify(prepared)
    astBytes += utf8(json)
    sizeByKey(prepared, keyBytes)
  }
  return { srcBytes, astBytes, keyBytes }
}

const printKeyTable = (keyBytes: Map<string, number>, n: number) => {
  const rows = [...keyBytes.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
  const w = Math.max(...rows.map(([k]) => k.length), 3)
  console.log(`  ${'key'.padEnd(w)}  ${'bytes'.padStart(10)}`)
  for (const [k, b] of rows) {
    console.log(`  ${k.padEnd(w)}  ${fmtBytes(b).padStart(10)}`)
  }
}

// --- corpus aggregate ---
let docs = [...load('rfds'), ...load('asciidoctor-extracted'), ...load('writers-guide')]
if (filter) docs = docs.filter((d) => d.name.includes(filter))

if (docs.length) {
  const { srcBytes, astBytes, keyBytes } = measure(docs)
  console.log(`\n=== Corpus (${docs.length} docs) ===`)
  console.log(`source:     ${fmtBytes(srcBytes)}`)
  console.log(
    `serialized: ${fmtBytes(astBytes)}  (${(astBytes / srcBytes).toFixed(1)}x source)`,
  )
  console.log(`\nTop ${top} keys by cumulative serialized bytes:`)
  printKeyTable(keyBytes, top)
} else {
  console.log('\n(no corpus docs found under tests/corpus — run tests/fetch-corpus.sh)')
}

// --- synthetic table-heavy doc (the per-cell duplication pathology) ---
{
  const src = makeTableHeavyDoc()
  const { srcBytes, astBytes, keyBytes } = measure([{ name: 'synthetic-tables', src }])
  console.log(`\n=== Synthetic table-heavy doc (${fmtBytes(srcBytes)} source) ===`)
  console.log(
    `serialized: ${fmtBytes(astBytes)}  (${(astBytes / srcBytes).toFixed(1)}x source)`,
  )
  console.log(`\nTop ${top} keys by cumulative serialized bytes:`)
  printKeyTable(keyBytes, top)
}
