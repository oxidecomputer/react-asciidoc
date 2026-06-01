// Run with: npx vite-node tests/triage.ts
// Walks every corpus document, computes the stock/react diff, and prints
// the first divergent characters of each failure so a glance can group
// failures by template/feature.
//
// Options:
//   --group          Group failures by prefix (subdirectory or category)
//   --filter <str>   Only test docs whose name contains <str>
//   --summary        Only print pass/fail counts and grouped summary
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { normalise, reactHtml, stockHtml } from './helpers'

const CORPUS_ROOT = join(dirname(fileURLToPath(import.meta.url)), 'corpus')

const load = (subdir: string) => {
  const dir = join(CORPUS_ROOT, subdir)
  const results: Array<{ name: string; src: string }> = []
  const walk = (current: string, prefix: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) {
        walk(full, `${prefix}${entry.name}/`)
      } else if (entry.name.endsWith('.adoc')) {
        results.push({
          name: `${subdir}/${prefix}${entry.name}`,
          src: readFileSync(full, 'utf8'),
        })
      }
    }
  }
  walk(dir, '')
  return results.sort((a, b) => a.name.localeCompare(b.name))
}

const args = process.argv.slice(2)
const filterArg = args.findIndex((a) => a === '--filter')
const filter = filterArg >= 0 ? args[filterArg + 1] : undefined
const groupMode = args.includes('--group') || args.includes('--summary')
const summaryOnly = args.includes('--summary')

const allDocs = [...load('rfds'), ...load('asciidoctor-extracted')]

const docs = filter ? allDocs.filter((d) => d.name.includes(filter)) : allDocs

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

if (groupMode) {
  const groups = new Map<
    string,
    { count: number; examples: Array<{ name: string; e: string; r: string }> }
  >()
  for (const f of fails) {
    // Derive group key from the divergence pattern
    const key = deriveKey(f.e, f.r)
    const g = groups.get(key) || { count: 0, examples: [] }
    g.count++
    if (g.examples.length < 3) g.examples.push(f)
    groups.set(key, g)
  }
  const sorted = [...groups.entries()].sort((a, b) => b[1].count - a[1].count)
  for (const [key, { count, examples }] of sorted) {
    console.log(`[${count} failures] ${key}`)
    for (const ex of examples) {
      console.log(`    ${ex.name} (at ${ex.pos})`)
      if (!summaryOnly) {
        console.log(`      E: ${JSON.stringify(ex.e)}`)
        console.log(`      R: ${JSON.stringify(ex.r)}`)
      }
    }
  }
} else {
  for (const f of fails) {
    console.log(`--- ${f.name} (at ${f.pos}) ---`)
    console.log(`  E: ${JSON.stringify(f.e)}`)
    console.log(`  R: ${JSON.stringify(f.r)}`)
  }
}

function deriveKey(e: string, r: string): string {
  if (e.includes('THREW:')) return 'runtime error (throws during render)'
  if (r.includes('{counter:') || r.includes('{counter2:'))
    return 'counter attribute not resolved'
  if (e.match(/\b\d+ [A-Z] [A-Z] [A-Z]/) || e.match(/\b\d+ \d+ \d+ \d+/))
    return 'counter numbering'
  if (e.includes('footnotedef_') || r.includes('footnotedef_'))
    return 'footnote numbering or text mismatch'
  if (
    e.includes('&lt;0&gt;') ||
    r.includes('&lt;0&gt;') ||
    e.includes('\x01') ||
    r.includes('\x01')
  )
    return 'sentinel leak (\\x01/\\x02 placeholders surviving)'
  if (e.includes('</code>,<code>') || r.includes('</code>,<code>'))
    return 'monospace/em nesting cross-boundaries'
  if (e.includes('</code></strong><code>') || r.includes('</code></strong><code>'))
    return 'nesting: strong crossed with code'
  if (e.includes('</em></code>') || r.includes('</em></code>'))
    return 'nesting: em crossed with code'
  if (e.includes('<code><em>') || e.includes('<em><code>'))
    return 'nesting: code crossed with em'
  if (e.includes('<strong><em>') || e.includes('<em><strong>'))
    return 'nesting: strong crossed with em'
  if (e.includes('<mark>') || r.includes('<mark>')) return 'mark element handling'
  if (e.includes('class="include"') || e.includes('class="bare include"'))
    return 'include macro handling'
  if (e.includes('frameBorder') || e.includes('onmousewheel'))
    return 'iframe attribute normalization (React)'
  if (e.includes('&lt;&lt;') || r.includes('&lt;&lt;'))
    return 'unresolved xref (<<id>> fallback)'
  if (e.includes('class="bare"') && r.includes('class="bare"'))
    return 'link class: bare vs include'
  if (r.includes('_{type}_') || r.includes('pass:quotes[') || r.includes('pass:'))
    return 'passthrough macro not processed'
  if (e.includes('class="details"') || e.includes('<details') || r.includes('<details'))
    return 'details/collapsible block'
  if (
    e.includes('class="checklist"') ||
    r.includes('fa-check-square-o') ||
    r.includes('fa-square-o')
  )
    return 'checklist (icons=font vs checkbox input)'
  if (e.includes('class="conum"') && r.includes('&lt;!--'))
    return 'callout: HTML comments vs icons=font markers'
  if (r.includes('conum') || (e.includes('conum') && r.includes('&lt;')))
    return 'callout rendering'
  if (e.includes('<span>') && r.includes('not this text'))
    return 'open block: span wrapper difference'
  if (e.includes(' paragraph in nested document') && r.includes('</p></td>'))
    return 'asciidoc table cell: nested document rendering'
  if (e.includes('{set:') || r.includes('{set:'))
    return 'set: attribute directive not processed'
  if (r.includes('{foo}') || r.includes('{bar}')) return 'attribute reference not resolved'
  if (e.includes('…​') || r.includes('....\n') || r.includes('{empty}'))
    return 'ellipsis/replacements rendering'
  if (e.includes('class="admonitionblock"') && r.includes('admonitionblock'))
    return 'admonition block rendering'
  if (e.includes('verse') || e.includes('verseblock')) return 'verse block rendering'
  if (e.includes('data-lang=') || e.includes('sourcehighlighter'))
    return 'source highlighter / code listing'
  if (/\bnext:\s*\d/.test(e) || /\bafter:\s*\d/.test(e)) return 'counter value wrong'
  if (r.includes('\\[') || r.includes('\\]')) return 'backslash escape in monospace'
  if (r.includes('\\#')) return 'backslash escape: hash'
  if (e.includes('class="bare include"') || r.includes('class="include"'))
    return 'link class: bare vs include'
  if (e.includes('<input') && e.includes('checkbox'))
    return 'checklist (icons=font vs checkbox input)'
  if (r.includes('{big}') || r.includes('{mycounter}') || r.includes('{math}'))
    return 'attribute reference not resolved'
  if (e.includes('<span>') && r.includes('<span>')) return 'open block span wrapper'
  return 'other'
}
