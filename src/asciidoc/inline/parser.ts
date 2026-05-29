import { QUOTE_SUBS } from './quotes'
import { QuotedTextSniffRx, SpecialCharsRx, SpecialCharsTr } from './rx'
import { InlineNode } from './types'

export interface ParseOptions {
  compatMode?: boolean
  attributes?: Record<string, string>
  /** Shared state for cross-call numbering (footnotes, etc.). If not
   *  provided, a fresh state is allocated for the call. */
  state?: ParseState
  /** Internal: true when this parseInline call is processing text that
   *  has already been through subSpecialchars (e.g. recursive call from
   *  subQuotes on inner text). Skip specialchars to avoid double-escape. */
  _alreadyEscaped?: boolean
  /** Internal: true when parsing the inner content of a quoted span. The
   *  email macro uses this to suppress linkification at position 0 (the
   *  quote tag's `>` is a non-linking context in stock asciidoctor). */
  _quoted?: boolean
}

export interface ParseState {
  footnoteIndex: number
  footnotesById: Map<string, number>
  /** Document-wide counters for `{counter:name}` / `{counter2:name}`. Shared
   *  across the whole document (including titles) so values increment in
   *  source order, matching asciidoctor. */
  counters?: Map<string, number | string>
}

function createParseState(): ParseState {
  return { footnoteIndex: 0, footnotesById: new Map() }
}

/** Increment (or initialise) a document counter and return its new value.
 *  Mirrors asciidoctor's `{counter:name[:seed]}` — the FIRST reference
 *  yields the seed (or 1), subsequent references increment. Supports integer
 *  and single-letter sequences. */
function nextCounterValue(
  counters: Map<string, number | string>,
  name: string,
  seed: string | undefined,
): number | string {
  const existing = counters.get(name)
  let value: number | string
  if (existing === undefined) {
    if (seed !== undefined && seed !== '') {
      value = /^-?\d+$/.test(seed) ? parseInt(seed, 10) : seed
    } else {
      value = 1
    }
  } else if (typeof existing === 'number') {
    value = existing + 1
  } else {
    // Single-letter sequence: advance the last char's code point.
    value = String.fromCharCode(existing.charCodeAt(existing.length - 1) + 1)
  }
  counters.set(name, value)
  return value
}

type SubType =
  | 'specialcharacters'
  | 'quotes'
  | 'attributes'
  | 'replacements'
  | 'macros'
  | 'post_replacements'
  | 'normal'
  | 'verbatim'

interface PassthroughEntry {
  text: string
  type: string
  subs: SubType[]
  attributes?: Record<string, string>
}

function passSlotPlaceholder(idx: number): string {
  return `\u0096${idx}\u0097`
}

function encodeQueryValue(s: string): string {
  return encodeURIComponent(s).replace(/%20/g, '+')
}

function parseImageAttrs(attrStr: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  if (!attrStr) return attrs
  const positional: string[] = []
  for (const part of attrStr.split(',')) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf('=')
    if (eq >= 0) {
      const k = trimmed.slice(0, eq).trim()
      let v = trimmed.slice(eq + 1).trim()
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1)
      }
      attrs[k] = v
    } else {
      positional.push(trimmed)
    }
  }
  if (positional[0] && !attrs.alt) attrs.alt = positional[0]
  if (positional[1] && !attrs.width) attrs.width = positional[1]
  if (positional[2] && !attrs.height) attrs.height = positional[2]
  return attrs
}

function splitKbdKeys(raw: string): string[] {
  // Match Ruby substitutors.rb kbd handler: first occurrence of `,` or `+`
  // (whichever appears earlier, starting from index 1) is the delimiter.
  // Trailing-delimiter case (Ctrl++ / Ctrl,,) makes the last key the delimiter itself.
  const keys = raw.trim()
  if (keys.length <= 1) return [keys]
  const commaIdx = keys.indexOf(',', 1)
  const plusIdx = keys.indexOf('+', 1)
  let delimIdx: number
  if (commaIdx >= 0 && plusIdx >= 0) {
    delimIdx = Math.min(commaIdx, plusIdx)
  } else if (commaIdx >= 0) {
    delimIdx = commaIdx
  } else if (plusIdx >= 0) {
    delimIdx = plusIdx
  } else {
    return [keys]
  }
  const delim = keys[delimIdx]
  if (keys.endsWith(delim)) {
    const parts = keys
      .slice(0, -1)
      .split(delim)
      .map((s) => s.trim())
    parts[parts.length - 1] = parts[parts.length - 1] + delim
    return parts
  }
  return keys.split(delim).map((s) => s.trim())
}

function deriveAltFromTarget(target: string): string {
  const basename = target.replace(/^.*\//, '').replace(/\.[^.]+$/, '')
  return basename.replace(/[_\-]/g, ' ')
}

function parseIconAttrs(attrStr: string): Record<string, string> {
  // For icons, positional 0 is the size (e.g. "large", "4x"), not alt.
  // Only named alt= sets alt text in the text fallback.
  const attrs: Record<string, string> = {}
  if (!attrStr) return attrs
  const positional: string[] = []
  for (const part of attrStr.split(',')) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf('=')
    if (eq >= 0) {
      const k = trimmed.slice(0, eq).trim()
      let v = trimmed.slice(eq + 1).trim()
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1)
      }
      attrs[k] = v
    } else {
      positional.push(trimmed)
    }
  }
  if (positional[0] && !attrs.size) attrs.size = positional[0]
  return attrs
}

function parseMailtoAttrs(attrStr: string): {
  text?: string
  subject?: string
  body?: string
  id?: string
  role?: string
} {
  if (!attrStr) return {}
  const out: Record<string, string> = {}
  const positional: string[] = []
  for (const part of attrStr.split(',')) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf('=')
    if (eq >= 0) {
      const k = trimmed.slice(0, eq).trim()
      let v = trimmed.slice(eq + 1).trim()
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1)
      }
      out[k] = v
    } else {
      positional.push(trimmed)
    }
  }
  if (positional[0]) out.text = positional[0]
  if (positional[1]) out.subject = positional[1]
  if (positional[2]) out.body = positional[2]
  return out
}

function parseQuotedTextAttributes(attrStr: string): {
  id?: string
  role?: string
} {
  if (!attrStr) return {}
  // Take only the first comma-separated piece; rest are ignored
  const head = attrStr.split(',', 1)[0].trim()
  if (!head) return {}

  if (head.includes('=')) {
    const all = parseAttributeList(attrStr)
    return {
      ...(all.id ? { id: all.id } : {}),
      ...(all.role ? { role: all.role } : {}),
    }
  }

  if (head.startsWith('.') || head.startsWith('#')) {
    let id: string | undefined
    const roles: string[] = []
    const tokens = head.match(/([.#])([^.#]*)/g) || []
    for (const tok of tokens) {
      const delim = tok[0]
      const val = tok.slice(1).trim()
      if (!val) continue
      if (delim === '#') id = val
      else roles.push(val)
    }
    return {
      ...(id ? { id } : {}),
      ...(roles.length ? { role: roles.join(' ') } : {}),
    }
  }

  return { role: head }
}

function parseAttributeList(attrStr: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  if (!attrStr) return attrs

  const parts = attrStr.split(',')
  let positional = 0
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()
    const eqIdx = part.indexOf('=')
    if (eqIdx >= 0) {
      const key = part.slice(0, eqIdx).trim()
      let value = part.slice(eqIdx + 1).trim()
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      }
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      }
      attrs[key] = value
    } else {
      switch (positional) {
        case 0:
          attrs.text = part
          break
        case 1:
          attrs.id = part
          break
        case 2:
          attrs.role = part
          break
        default:
          attrs[`${positional}`] = part
          break
      }
      positional++
    }
  }
  return attrs
}

function subSpecialchars(text: string): string {
  return text.replace(SpecialCharsRx, (ch) => SpecialCharsTr[ch] || ch)
}

function subAttributes(
  text: string,
  attributes: Record<string, string>,
  state?: ParseState,
): string {
  // Counters first: `{counter:name}` outputs the new value, `{counter2:name}`
  // increments silently. Both advance a document-wide counter.
  if (state && text.indexOf('{counter') !== -1) {
    if (!state.counters) state.counters = new Map()
    const counters = state.counters
    text = text.replace(
      /(\\)?\{(counter2?):([\w-]+)(?::([^}]*))?\}/g,
      (match, esc, kind, name, seed) => {
        if (esc) return match.slice(1)
        const value = nextCounterValue(counters, name, seed)
        // Keep the doc-attribute view in sync so plain `{name}` reflects it.
        attributes[name] = String(value)
        return kind === 'counter2' ? '' : String(value)
      },
    )
  }
  return text.replace(/(\\)?\{(\w[\w-]*)\}/g, (match, esc, name) => {
    if (esc) return '{' + name + '}'
    const key = name.toLowerCase()
    if (Object.prototype.hasOwnProperty.call(INTRINSIC_ATTRIBUTES, key)) {
      return INTRINSIC_ATTRIBUTES[key]
    }
    if (Object.prototype.hasOwnProperty.call(attributes, name)) {
      return attributes[name]
    }
    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
      return attributes[key]
    }
    return match
  })
}

// Subset of asciidoctor's INTRINSIC_ATTRIBUTES, covering the inline-relevant
// entries. Add more as fixtures demand.
const INTRINSIC_ATTRIBUTES: Record<string, string> = {
  empty: '',
  sp: ' ',
  nbsp: '&#160;',
  zwsp: '&#8203;',
  wj: '&#8288;',
  apos: '&#39;',
  quot: '&#34;',
  lsquo: '&#8216;',
  rsquo: '&#8217;',
  ldquo: '&#8220;',
  rdquo: '&#8221;',
  deg: '&#176;',
  plus: '&#43;',
  brvbar: '&#166;',
  amp: '&amp;',
  lt: '&lt;',
  gt: '&gt;',
  startsb: '[',
  endsb: ']',
  vbar: '|',
  caret: '^',
  asterisk: '*',
  tilde: '~',
  backslash: '\\',
  backtick: '`',
  'two-colons': '::',
  'two-semicolons': ';;',
  cpp: 'C++',
}

function subReplacements(text: string): string {
  // Replacement helper: if the matched fragment contains a backslash,
  // strip it and emit the literal (no replacement); otherwise emit `repl`.
  function r(pattern: RegExp, repl: string, capturePrefix?: number): string {
    return text.replace(pattern, (match, ...args) => {
      if (match.includes('\\')) {
        return match.replace('\\', '')
      }
      // If pattern has a leading-capture group, prepend it.
      if (capturePrefix !== undefined && args[capturePrefix - 1]) {
        return args[capturePrefix - 1] + repl
      }
      return repl
    })
  }

  text = r(/\\?\(C\)/g, '&#169;')
  text = r(/\\?\(R\)/g, '&#174;')
  text = r(/\\?\(TM\)/g, '&#8482;')
  text = text.replace(/(^|[ \n]|\\)--([ \n]|$)/g, (match) => {
    if (match.includes('\\')) return match.replace('\\', '')
    return '&#8201;&#8212;&#8201;'
  })
  // Word-joining em-dash: asciidoctor fires this between any two "word"
  // characters, which includes digits (`2190--2020`) — not just letters.
  text = text.replace(/([\p{L}\p{N}_])\\?--(?=[\p{L}\p{N}_])/gu, (match, word) => {
    if (match.includes('\\')) return match.replace('\\', '')
    return word + '&#8212;&#8203;'
  })
  text = r(/\\?\.\.\./g, '&#8230;&#8203;')
  text = text.replace(/([\p{L}\p{N}])\\?'(?=\p{L})/gu, (match, alnum) => {
    if (match.includes('\\')) return match.replace('\\', '')
    return alnum + '&#8217;'
  })
  // back-tick-apostrophe explicit right single quote
  text = text.replace(/\\?`'/g, (match) => {
    if (match.startsWith('\\')) return match.slice(1)
    return '&#8217;'
  })
  // Arrows: specialchars has already escaped < and >.
  text = r(/\\?-&gt;/g, '&#8594;')
  text = r(/\\?=&gt;/g, '&#8658;')
  text = r(/\\?&lt;-/g, '&#8592;')
  text = r(/\\?&lt;=/g, '&#8656;')
  // Restore valid entity refs that were escaped by specialchars; honor `\` escape.
  // \&copy; in source → &amp;copy; literal in output (escape ampersand).
  // &copy;  in source → &copy; (entity preserved).
  text = text.replace(
    /(\\)?&amp;([a-zA-Z][a-zA-Z]+\d{0,2};|#\d{1,7};|#x[\da-fA-F]{1,6};)/g,
    (_match, esc, body) => (esc ? '&amp;' + body : '&' + body),
  )
  return text
}

// Index-based placeholder format: `\x01<digits>\x02` references an entry in
// the `placeholders` array. Both quote and macro substitutions push to the
// same array. We use indices (not embedded JSON) so the placeholder body
// can't be matched by surrounding macro regex `]` terminators.
function emitPlaceholder(placeholders: InlineNode[][], nodes: InlineNode[]): string {
  const idx = placeholders.length
  placeholders.push(nodes)
  return '\x01' + idx + '\x02'
}

function rebuildAllPlaceholders(
  source: string,
  placeholders: InlineNode[][],
  seen: Set<number> = new Set(),
): InlineNode[] {
  const nodes: InlineNode[] = []
  const re = /\x01(\d+)\x02/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(source)) !== null) {
    const leading = source.slice(lastIndex, match.index)
    if (leading) {
      nodes.push({ type: 'text', text: leading })
    }
    const idx = parseInt(match[1], 10)
    const entry = placeholders[idx]
    if (entry && !seen.has(idx)) {
      seen.add(idx)
      for (const n of entry) {
        nodes.push(resolveNestedPlaceholders(n, placeholders, seen))
      }
      seen.delete(idx)
    } else if (entry) {
      // Cyclic self-reference (a nested-parse index collision produced a
      // placeholder whose own body references it). Break the loop rather
      // than recurse forever; emit nothing for the cyclic slot.
    }
    lastIndex = match.index + match[0].length
  }
  const trailing = source.slice(lastIndex)
  if (trailing) {
    nodes.push({ type: 'text', text: trailing })
  }
  if (nodes.length === 0 && source.length > 0) {
    nodes.push({ type: 'text', text: source })
  }
  return nodes
}

function resolveNestedPlaceholders(
  n: InlineNode,
  placeholders: InlineNode[][],
  seen: Set<number> = new Set(),
): InlineNode {
  if (n.type === 'text') return n
  if (
    n.type === 'quoted' ||
    n.type === 'anchor' ||
    n.type === 'footnote' ||
    n.type === 'button'
  ) {
    const newText: InlineNode[] = []
    for (const child of n.text) {
      if (child.type === 'text' && child.text.indexOf('\x01') !== -1) {
        const rebuilt = rebuildAllPlaceholders(child.text, placeholders, seen)
        for (const r of rebuilt) newText.push(r)
      } else {
        newText.push(resolveNestedPlaceholders(child, placeholders, seen))
      }
    }
    return { ...n, text: newText } as InlineNode
  }
  return n
}

export function parseInline(text: string, opts: ParseOptions = {}): InlineNode[] {
  const compatMode = opts.compatMode ?? false
  const attributes = opts.attributes ?? {}
  const state = opts.state ?? createParseState()

  const quoteSubs = compatMode ? QUOTE_SUBS.compat : QUOTE_SUBS.nonCompat

  let source = text

  const sniffRx = compatMode ? QuotedTextSniffRx['true'] : QuotedTextSniffRx['false']

  const passthroughs: PassthroughEntry[] = []
  const placeholders: InlineNode[][] = []

  source = extractPassthroughs(source, passthroughs, compatMode)

  if (!opts._alreadyEscaped) {
    source = subSpecialchars(source)
  }

  if (source.match(/\*/) || source.match(/_/) || sniffRx.test(source)) {
    source = subQuotes(source, quoteSubs, placeholders, state)
  }

  source = subAttributes(source, attributes, state)

  source = subReplacements(source)

  source = subMacrosOnString(
    source,
    attributes,
    compatMode,
    placeholders,
    state,
    opts._quoted ?? false,
  )

  let nodes = rebuildAllPlaceholders(source, placeholders)
  nodes = subPostReplacements(nodes, attributes)
  nodes = restorePassthroughs(nodes, passthroughs, compatMode, state)

  return nodes
}

function extractPassthroughs(
  source: string,
  passthroughs: PassthroughEntry[],
  compatMode: boolean,
): string {
  // Two-pass extraction: first the "macro-like" passthroughs (pass:, stem:,
  // +++, $$, ++), then single-+ and single-` (compat). Order matters because
  // single-+ greedily eats content that may contain pass:[] / $$ etc.
  source = extractHighPriorityPassthroughs(source, passthroughs, compatMode)
  source = extractLowPriorityPassthroughs(source, passthroughs, compatMode)
  return source
}

function extractHighPriorityPassthroughs(
  source: string,
  passthroughs: PassthroughEntry[],
  compatMode: boolean,
): string {
  let result = ''
  let i = 0
  const len = source.length

  const triplePlusPattern = compatMode ? null : /^\+\+\+([\s\S]*?)\+\+\+/
  const doublePlusPattern = compatMode ? null : /^(?:\[([^\[\]]+)\])?\+\+([\s\S]+?)\+\+/
  const passPattern = /^pass:([a-z]+(?:,[a-z-]+)*)?\[(|[\s\S]*?[^\\])\]/
  const stemPattern =
    /^(stem|(?:latex|ascii)math):([a-z]+(?:,[a-z-]+)*)?\[([\s\S]*?[^\\])\]/

  while (i < len) {
    if (source[i] === '$' && source[i + 1] === '$') {
      const end = source.indexOf('$$', i + 2)
      if (end >= 0) {
        const content = source.slice(i + 2, end)
        const idx = passthroughs.length
        passthroughs.push({
          text: content,
          type: 'unquoted',
          subs: ['specialcharacters'],
        })
        result += passSlotPlaceholder(idx)
        i = end + 2
        continue
      }
    }

    if (source[i] === '+' && triplePlusPattern) {
      const match = source.slice(i).match(triplePlusPattern)
      if (match) {
        const idx = passthroughs.length
        passthroughs.push({
          text: match[1],
          type: 'unquoted',
          subs: [],
        })
        result += passSlotPlaceholder(idx)
        i += match[0].length
        continue
      }
    }

    if ((source[i] === '+' || source[i] === '[') && doublePlusPattern) {
      const slice = source.slice(i)
      if (!slice.startsWith('+++')) {
        const match = slice.match(doublePlusPattern)
        if (match) {
          const attrList = match[1] || ''
          const text = match[2]
          const idx = passthroughs.length
          const parsed = parseQuotedTextAttributes(attrList)
          passthroughs.push({
            text,
            type: 'unquoted',
            subs: ['specialcharacters'],
            attributes: {
              ...(parsed.id ? { id: parsed.id } : {}),
              ...(parsed.role ? { role: parsed.role } : {}),
            },
          })
          result += passSlotPlaceholder(idx)
          i += match[0].length
          continue
        }
      }
    }

    if (source[i] === 'p' && source.slice(i, i + 5) === 'pass:') {
      const match = source.slice(i).match(passPattern)
      if (match) {
        const subs = match[1] ? resolveInlineSubs(match[1]) : []
        const content = match[2]
        const idx = passthroughs.length
        passthroughs.push({
          text: content,
          type: 'unquoted',
          subs,
        })
        result += passSlotPlaceholder(idx)
        i += match[0].length
        continue
      }
    }

    if (source[i] === 's' || source[i] === 'a' || source[i] === 'l') {
      const match = source.slice(i).match(stemPattern)
      if (match) {
        const content = match[3]
        const idx = passthroughs.length
        const stemType = match[1] === 'asciimath' ? 'asciimath' : 'latexmath'
        passthroughs.push({
          text: content,
          type: stemType,
          subs: ['specialcharacters'],
        })
        result += passSlotPlaceholder(idx)
        i += match[0].length
        continue
      }
    }

    result += source[i]
    i++
  }

  return result
}

function extractLowPriorityPassthroughs(
  source: string,
  passthroughs: PassthroughEntry[],
  compatMode: boolean,
): string {
  let result = ''
  let i = 0
  const len = source.length

  // In non-compat: single + is unquoted passthrough w/ specialchars.
  // In compat:   single ` is monospaced passthrough w/ specialchars.
  // Trailing word char disallowed (so `foo+bar+` doesn't match if `bar+` is
  // followed by a word char).
  const inlinePassPattern = compatMode
    ? /^(?:\[([^\[\]]+)\])?(`)([^`]|[^`][\s\S]*?[^`])\2(?![A-Za-z0-9_])/
    : /^(?:\[([^\[\]]+)\])?(\+)(\S|\S[\s\S]*?\S)\2(?![A-Za-z0-9_])/

  // Preceding char must be start-of-string OR not in [word chars ; : \].
  const blockedPrev = /[A-Za-z0-9_;:\\]/

  while (i < len) {
    if (compatMode ? source[i] === '`' : source[i] === '+') {
      if (i === 0 || !blockedPrev.test(source[i - 1])) {
        const match = source.slice(i).match(inlinePassPattern)
        if (match) {
          const content = match[3]
          const idx = passthroughs.length
          passthroughs.push({
            text: content,
            type: compatMode ? 'monospaced' : 'unquoted',
            subs: ['specialcharacters'],
          })
          result += passSlotPlaceholder(idx)
          i += match[0].length
          continue
        }
      }
    }

    result += source[i]
    i++
  }

  return result
}

function resolveInlineSubs(subStr: string): SubType[] {
  const hintMap: Record<string, SubType> = {
    a: 'attributes',
    m: 'macros',
    n: 'normal',
    p: 'post_replacements',
    q: 'quotes',
    r: 'replacements',
    c: 'specialcharacters',
    v: 'verbatim',
  }
  const subs: SubType[] = []
  for (const part of subStr.split(',')) {
    const trimmed = part.trim()
    const hint = hintMap[trimmed]
    if (hint === 'normal') {
      subs.push(
        'specialcharacters',
        'quotes',
        'attributes',
        'replacements',
        'macros',
        'post_replacements',
      )
    } else if (hint) {
      subs.push(hint)
    }
  }
  if (subs.length === 0) subs.push('specialcharacters')
  return subs
}

function subQuotes(
  source: string,
  quoteSubs: typeof QUOTE_SUBS.nonCompat,
  placeholders: InlineNode[][],
  state: ParseState,
): string {
  for (const entry of quoteSubs) {
    let result = ''
    let remaining = source
    const isConstrained = entry.scope === 'constrained'

    while (remaining.length > 0) {
      const match = entry.rx.exec(remaining)
      if (!match) {
        result += remaining
        break
      }

      const fullMatch = match[0]
      const matchStart = match.index

      result += remaining.slice(0, matchStart)

      let leadingChar = ''
      let attrList = ''
      let innerText = ''
      if (isConstrained) {
        leadingChar = match[1] || ''
        attrList = match[2] || ''
        innerText = match[3] || ''
      } else {
        attrList = match[1] || ''
        innerText = match[2] || ''
      }

      // Asciidoctor's convert_quoted_text treats a leading `\` (in the
      // captured match, which for constrained scope includes the leading
      // boundary char) as an escape: strip the `\` and emit the rest of
      // the match as literal text. This applies to BOTH scopes; for
      // `\\X…X` (double backslash + unconstrained marker), the two passes
      // cascade — unconstrained pass strips one `\`, constrained pass
      // strips the other.
      const wholeEscaped = fullMatch.startsWith('\\')

      // Triple-backtick (and similar adjacent-marker) handling for
      // unconstrained mono. For ``````code``````, the greedy-then-non-greedy
      // regex finds ``\`code`` at the leftmost position with content
      // `\`code`. Asciidoctor's sequential gsub produces nested
      // <code><code>code</code></code> because its HTML replacement leaves
      // an inner backtick visible for the next pass. We don't have that
      // sequential property with placeholders, so we absorb the trailing
      // backtick into content here and let the recursive parse pick up a
      // constrained mono inside.
      let absorbedTrailing = 0
      if (
        !wholeEscaped &&
        entry.type === 'monospaced' &&
        !isConstrained &&
        innerText.startsWith('`') &&
        remaining[matchStart + fullMatch.length] === '`'
      ) {
        innerText = innerText + '`'
        absorbedTrailing = 1
      }

      if (wholeEscaped) {
        result += fullMatch.slice(1)
      } else {
        if (leadingChar) result += leadingChar

        let role: string | undefined
        let id: string | undefined
        if (attrList) {
          const attrs = parseQuotedTextAttributes(attrList)
          role = attrs.role
          id = attrs.id
        }

        // Unescape `\]` → `]` in inner content. This matches asciidoctor's
        // normalize_text(text, false, true) called from various macro/label
        // captures. Without this, `\]` survives as literal in the output.
        const normalizedInner = innerText.replace(/\\\]/g, ']')
        const subtree = parseInline(normalizedInner, {
          compatMode: false,
          state,
          _alreadyEscaped: true,
          _quoted: true,
        })

        const node: InlineNode = {
          type: 'quoted',
          subtype: entry.type,
          text: subtree,
          ...(id ? { id } : {}),
          ...(role ? { role } : {}),
        }
        result += emitPlaceholder(placeholders, [node])
      }

      remaining = remaining.slice(matchStart + fullMatch.length + absorbedTrailing)
    }
    source = result
  }

  return source
}

function processInlineText(text: string): InlineNode[] {
  // Labels captured from macro matches are post-quotes/attrs/replacements text
  // that may contain quote placeholder sentinels. We wrap them as a TextNode
  // here; rebuildAllPlaceholders will split the placeholders into proper
  // sub-nodes when the macro's parent placeholder is decoded.
  if (!text) return []
  return [{ type: 'text', text }]
}

interface MacroHandler {
  rx: RegExp
  handler: (
    match: RegExpExecArray,
    attrs: Record<string, string>,
  ) => InlineNode | InlineNode[] | null
}

function subMacrosOnString(
  source: string,
  attributes: Record<string, string>,
  _compatMode: boolean,
  placeholders: InlineNode[][],
  state: ParseState,
  quotedStart: boolean = false,
): string {
  const result: string[] = []
  let text = source

  const experimental = Object.prototype.hasOwnProperty.call(attributes, 'experimental')
  const iconsAttr = Object.prototype.hasOwnProperty.call(attributes, 'icons')
    ? attributes['icons']
    : undefined
  const iconType: 'text' | 'image' | 'font' =
    iconsAttr === undefined ? 'text' : iconsAttr === 'font' ? 'font' : 'image'

  const macroRegexes: MacroHandler[] = [
    {
      rx: /(\\)?(kbd|btn):\[([\s\S]*?[^\\])\]/,
      handler: (m) => {
        if (m[1]) return null
        if (!experimental) return null
        if (m[2] === 'kbd') {
          return {
            type: 'kbd',
            keys: splitKbdKeys(m[3]),
          }
        }
        return { type: 'button', text: processInlineText(m[3]) }
      },
    },
    {
      rx: /\\?menu:(\w|[&\w][^\n\[]*[^\s\[])\[ *(?:|([\s\S]*?[^\\]))\]/,
      handler: (m) => {
        if (m[0].startsWith('\\')) return null
        if (!experimental) return null
        // By the time macros run, `>` has been escaped to `&gt;` by
        // specialchars. Split on either form for robustness.
        const items = m[2] ? [m[1], ...m[2].split(/&gt;|>/).map((s) => s.trim())] : [m[1]]
        return { type: 'menu', items }
      },
    },
    {
      rx: /\\?(image|icon):([^:\s\[](?:[^\n\[]*[^\s\[])?)\[(|[\s\S]*?[^\\])\]/,
      handler: (m) => {
        if (m[0].startsWith('\\')) return null
        const isIcon = m[1] === 'icon'
        const attrs = isIcon ? parseIconAttrs(m[3]) : parseImageAttrs(m[3])
        const target = m[2]
        const alt = attrs.alt || (isIcon ? target : deriveAltFromTarget(target))
        return {
          type: 'image',
          subtype: isIcon ? 'icon' : 'image',
          target,
          alt,
          width: attrs.width,
          height: attrs.height,
          id: attrs.id,
          role: attrs.role,
          title: attrs.title,
          ...(isIcon ? { iconType } : {}),
        } as InlineNode
      },
    },
    {
      rx: new RegExp(
        String.raw`\\?(?:(indexterm2?):\[([\s\S]*?[^\\])\]|\(\(([\s\S]+?)\)\)(?!\)))`,
      ),
      handler: (m) => {
        if (m[0].startsWith('\\')) return null
        const raw = m[2] || m[3] || ''
        const terms = raw.split(',').map((s: string) => s.trim())
        const visible = m[1] ? m[1].startsWith('indexterm2') : m[0].startsWith('((')
        const v = visible === true
        return { type: 'indexterm', terms, visible: v }
      },
    },
    {
      // The bibref macro must run BEFORE the URL/link macros in macroRegexes:
      // otherwise the URL macro's leading-context capture group (which
      // includes `]`) eats the third `]` of `[[[id]]]https://...` patterns
      // and leaves only `[[id]]` for the ref macro to match. Ids accept
      // any Unicode letter/digit — RFD citations occasionally use
      // non-ASCII chars (e.g. `lipiński-2011`).
      // A bibliography anchor id must be a valid XML name: it starts with a
      // letter or `_` (NOT a digit). `[[[22-update]]]` is therefore left as
      // literal text by stock, while `[[[lipiński-2011]]]` (Unicode letter)
      // is a valid bibref.
      rx: /\[\[\[([\p{L}_][\p{L}\p{N}_\-:.]*)(?:, *([\s\S]+?))?\]\]\]/u,
      handler: (m) => {
        return {
          type: 'anchor',
          subtype: 'bibref',
          text: processInlineText(m[2] || m[1]),
          target: m[1],
        }
      },
    },
    {
      // The target must not start with `:` — `link::https://…` is malformed
      // (double colon) and stock asciidoctor leaves it literal rather than
      // producing a link whose href begins with `:`.
      rx: /\\?(?:link|(mailto)):\s*(|[^\s\[:][^\s\[]*)\[(|[\s\S]*?[^\\])\]/,
      handler: (m): InlineNode | null => {
        if (m[0].startsWith('\\')) return null
        const isMailto = m[1] === 'mailto'
        const rawAttrs = m[3] || ''

        if (isMailto) {
          const parsed = parseMailtoAttrs(rawAttrs)
          const email = m[2]
          let target = 'mailto:' + email
          const params: string[] = []
          if (parsed.subject) {
            params.push(`subject=${encodeQueryValue(parsed.subject)}`)
          }
          if (parsed.body) {
            params.push(`body=${encodeQueryValue(parsed.body)}`)
          }
          if (params.length) {
            target += '?' + params.join('&')
          }
          const text: InlineNode[] = parsed.text
            ? processInlineText(parsed.text)
            : [{ type: 'text', text: email }]
          return {
            type: 'anchor',
            subtype: 'link',
            text,
            target,
            ...(parsed.id ? { id: parsed.id } : {}),
            ...(parsed.role ? { role: parsed.role } : {}),
          }
        }

        const target = m[2]
        if (rawAttrs === '') {
          return {
            type: 'anchor',
            subtype: 'link',
            text: [{ type: 'text', text: target }],
            target,
            role: 'bare',
          }
        }
        let labelText = rawAttrs
        let windowAttr: string | undefined
        if (labelText.endsWith('^')) {
          labelText = labelText.slice(0, -1)
          windowAttr = '_blank'
        }
        return {
          type: 'anchor',
          subtype: 'link',
          text: processInlineText(labelText),
          target,
          ...(windowAttr ? { window: windowAttr } : {}),
        }
      },
    },
    {
      rx: /(?<=^|\s|&lt;|>|[\(\)\[\];"'`\x02-\x05])(\\?(?:https?|file|ftp|irc):\/\/)(?:([^\s\[\]]+)\[(|[\s\S]*?[^\\])\]|([^\s]+)&gt;|([^\s\[\]<]*([^\s,.?!\[\]<\)])))/m,
      handler: (m): InlineNode[] | null => {
        if (m[1].startsWith('\\')) {
          const scheme = m[1].slice(1)
          const rest =
            m[2] !== undefined
              ? `${m[2]}[${m[3] || ''}]`
              : m[4] !== undefined
                ? `${m[4]}&gt;`
                : m[5] || ''
          return [{ type: 'text', text: scheme + rest }]
        }
        const scheme = m[1]

        let target: string
        let label: InlineNode[]
        let role: string | undefined
        let suffix = ''
        let windowAttr: string | undefined

        if (m[2] !== undefined) {
          target = scheme + m[2]
          let linkText = m[3] || ''
          if (linkText) {
            if (linkText.endsWith('^')) {
              linkText = linkText.slice(0, -1)
              windowAttr = '_blank'
            }
            label = processInlineText(linkText)
          } else {
            label = [{ type: 'text', text: target }]
            role = 'bare'
          }
        } else if (m[4] !== undefined) {
          target = scheme + m[4]
          label = [{ type: 'text', text: target }]
          role = 'bare'
        } else {
          target = scheme + (m[5] || '')
          const last = m[6] || ''
          if (last === ';') {
            target = target.slice(0, -1)
            if (target.endsWith(')')) {
              target = target.slice(0, -1)
              suffix = ');'
            } else {
              suffix = ';'
            }
          } else if (last === ':') {
            target = target.slice(0, -1)
            if (target.endsWith(')')) {
              target = target.slice(0, -1)
              suffix = '):'
            } else {
              suffix = ':'
            }
          }
          if (target === scheme) {
            return [{ type: 'text', text: m[0] }]
          }
          label = [{ type: 'text', text: target }]
          role = 'bare'
        }

        // `:hide-uri-scheme:` drops the `scheme://` from the DISPLAYED text of
        // a bare URL (the href is unchanged). Only applies when there's no
        // explicit link text.
        if (
          role === 'bare' &&
          Object.prototype.hasOwnProperty.call(attributes, 'hide-uri-scheme')
        ) {
          label = [{ type: 'text', text: target.replace(/^[a-z][a-z0-9.+-]*:\/\//i, '') }]
        }

        const result: InlineNode[] = []
        result.push({
          type: 'anchor',
          subtype: 'link',
          text: label,
          target,
          ...(role ? { role } : {}),
          ...(windowAttr ? { window: windowAttr } : {}),
        })
        if (suffix) {
          result.push({ type: 'text', text: suffix })
        }
        return result
      },
    },
    {
      rx: /([\\>:/])?\w(?:&amp;|[\w\-.%+])*@[\w][\w_\-.]*\.[a-zA-Z]{2,5}\b/,
      handler: (m) => {
        const prefix = m[1] || ''
        if (prefix && prefix !== ':' && !prefix.startsWith('&')) return null
        // Asciidoctor runs the email macro AFTER quotes, so an email at the
        // very start of quoted content (`\`a@b.com\``, `*a@b.com*`) is
        // preceded by the quote tag's `>` — a non-linking context. Our
        // recursive parse of quoted content strips that boundary, so emulate
        // it: at the start of quoted content with no prefix, don't linkify.
        if (quotedStart && m.index === 0 && !prefix) return null
        const email = m[0]
        return {
          type: 'anchor',
          subtype: 'link',
          text: [{ type: 'text', text: email }],
          target: 'mailto:'.concat(email),
        }
      },
    },
    {
      rx: new RegExp(
        String.raw`(\\)?(?:\[\[([A-Za-z_][\w\-:.]*)(?:, *([\s\S]+?))? ?\]\]|anchor:([A-Za-z_][\w\-:.]*)\[(?:\]|([\s\S]*?[^\\])\]))`,
      ),
      handler: (m) => {
        if (m[1]) return null
        const refid = m[2] || m[4] || ''
        const reftext = m[3] || m[5] || ''
        return {
          type: 'anchor',
          subtype: 'ref',
          text: processInlineText(reftext || refid),
          target: refid,
          id: refid,
        }
      },
    },
    {
      rx: new RegExp(
        String.raw`\\?(?:&lt;&lt;([\w#/.:{][\s\S]*?)&gt;&gt;|xref:([\w#/.:{][\s\S]*?)\[(?:\]|([\s\S]*?[^\\])\]))`,
      ),
      handler: (m) => {
        if (m[0].startsWith('\\')) return null
        // Shorthand: <<target,reftext>>  vs macro: xref:target[label]
        if (m[1] !== undefined) {
          // Ruby splits on the FIRST comma only (`refid.partition ','`) and
          // lstrips the reftext — JS `split(',', 2)` would DROP everything
          // after the second comma, truncating reftexts that contain commas
          // (e.g. `<<id,RFD 78 Customers, Roles, and Priorities>>`). The
          // target is left untrimmed so a trailing space prevents a natural
          // match, exactly as stock does.
          const ci = m[1].indexOf(',')
          const target = ci === -1 ? m[1] : m[1].slice(0, ci)
          const rawRef = ci === -1 ? '' : m[1].slice(ci + 1).replace(/^\s+/, '')
          const reftext = rawRef || `[${target}]`
          return {
            type: 'anchor',
            subtype: 'xref',
            text: processInlineText(reftext),
            target,
          }
        }
        const target = (m[2] || '').trim()
        const label = (m[3] || '').trim()
        return {
          type: 'anchor',
          subtype: 'xref',
          text: processInlineText(label || `[${target}]`),
          target,
        }
      },
    },
    {
      rx: /\\?footnote(?:(ref):|:([\w-]+)?)\[(?:|([\s\S]*?[^\\]))\](?!<\/a>)/,
      handler: (m) => {
        if (m[0].startsWith('\\')) return null
        const id = m[2]
        const text = m[3] || ''
        // footnoteref:id[] (deprecated) or footnote:id[content] with empty
        // content → reference to an existing footnote.
        if (m[1] === 'ref' || (id && !text)) {
          // Reference an existing footnote (by id)
          const existing = id ? state.footnotesById.get(id) : undefined
          return {
            type: 'footnote',
            text: [],
            refid: id,
            ...(existing !== undefined ? { index: existing } : {}),
          }
        }
        // Definition (with or without id)
        state.footnoteIndex++
        const index = state.footnoteIndex
        if (id) state.footnotesById.set(id, index)
        return {
          type: 'footnote',
          text: processInlineText(text),
          ...(id ? { id } : {}),
          index,
        }
      },
    },
  ]

  // Apply each macro as its own full-text pass (gsub-style). Order in
  // macroRegexes determines priority — earlier patterns run first and may
  // turn their matched spans into placeholders that later patterns won't
  // see. This matches Ruby asciidoctor's `sub_macros` behavior and is
  // important e.g. for `footnote:[... https://x[y] ...]` where the URL
  // inside must be consumed before the footnote regex runs.
  let working = text
  for (const { rx, handler } of macroRegexes) {
    const globalRx = ensureGlobalFlag(rx)
    globalRx.lastIndex = 0
    const out: string[] = []
    let lastEnd = 0
    let m: RegExpExecArray | null
    while ((m = globalRx.exec(working)) !== null) {
      // Zero-length match safety
      if (m[0].length === 0) {
        globalRx.lastIndex++
        continue
      }
      if (m.index > lastEnd) {
        out.push(working.slice(lastEnd, m.index))
      }
      const node = handler(m, attributes)
      if (node) {
        const nodes = Array.isArray(node) ? node : [node]
        out.push(emitPlaceholder(placeholders, nodes))
      } else {
        out.push(m[0])
      }
      lastEnd = m.index + m[0].length
    }
    if (lastEnd < working.length) {
      out.push(working.slice(lastEnd))
    }
    working = out.join('')
  }
  return working
}

const _globalFlagCache = new WeakMap<RegExp, RegExp>()
function ensureGlobalFlag(rx: RegExp): RegExp {
  if (rx.flags.includes('g')) return rx
  const cached = _globalFlagCache.get(rx)
  if (cached) return cached
  const g = new RegExp(rx.source, rx.flags + 'g')
  _globalFlagCache.set(rx, g)
  return g
}

function restorePassthroughs(
  nodes: InlineNode[],
  passthroughs: PassthroughEntry[],
  compatMode: boolean,
  state: ParseState,
): InlineNode[] {
  const slotRe = /(\d+)/g
  function restoreText(text: string): InlineNode[] {
    const node: InlineNode = { type: 'text', text }
    if (text.indexOf('') === -1) return [node]

    const out: InlineNode[] = []
    let lastIndex = 0
    slotRe.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = slotRe.exec(text)) !== null) {
      if (m.index > lastIndex) {
        out.push({ type: 'text', text: text.slice(lastIndex, m.index) })
      }
      const idx = parseInt(m[1], 10)
      const pt = passthroughs[idx]
      if (!pt) {
        // Unknown placeholder — keep as-is so an outer level can restore it.
        out.push({ type: 'text', text: m[0] })
        lastIndex = m.index + m[0].length
        continue
      }
      if (pt) {
        let inner: InlineNode[]
        if (pt.subs.length === 0) {
          inner = [{ type: 'text', text: pt.text }]
        } else if (pt.subs.length === 1 && pt.subs[0] === 'specialcharacters') {
          inner = [{ type: 'text', text: subSpecialchars(pt.text) }]
        } else {
          inner = parseInline(pt.text, { compatMode, state })
        }
        // Restore any nested passthroughs whose placeholders are inside `inner`.
        inner = restorePassthroughs(inner, passthroughs, compatMode, state)

        const ptAttrs = pt.attributes ?? {}
        const hasAttrs = !!(ptAttrs.id || ptAttrs.role)
        if (pt.type === 'unquoted' || pt.type === 'normal') {
          if (hasAttrs) {
            out.push({
              type: 'quoted',
              subtype: 'unquoted',
              text: inner,
              ...(ptAttrs.id ? { id: ptAttrs.id } : {}),
              ...(ptAttrs.role ? { role: ptAttrs.role } : {}),
            })
          } else {
            out.push(...inner)
          }
        } else if (
          pt.type === 'monospaced' ||
          pt.type === 'asciimath' ||
          pt.type === 'latexmath'
        ) {
          out.push({
            type: 'quoted',
            subtype: pt.type as 'monospaced' | 'asciimath' | 'latexmath',
            text: inner,
            ...(ptAttrs.id ? { id: ptAttrs.id } : {}),
            ...(ptAttrs.role ? { role: ptAttrs.role } : {}),
          })
        } else {
          out.push(...inner)
        }
      }
      lastIndex = m.index + m[0].length
    }
    if (lastIndex < text.length) {
      out.push({ type: 'text', text: text.slice(lastIndex) })
    }
    return out.length > 0 ? out : [node]
  }

  function visit(n: InlineNode): InlineNode[] {
    if (n.type === 'text') {
      return restoreText(n.text)
    }
    if (
      n.type === 'quoted' ||
      n.type === 'anchor' ||
      n.type === 'footnote' ||
      n.type === 'button'
    ) {
      return [{ ...n, text: n.text.flatMap(visit) } as InlineNode]
    }
    return [n]
  }

  return nodes.flatMap(visit)
}

function subPostReplacements(
  nodes: InlineNode[],
  attributes: Record<string, string>,
): InlineNode[] {
  // `:hardbreaks:` sets the `hardbreaks` doc attribute; `:hardbreaks-option:`
  // (and `[%hardbreaks]`) set `hardbreaks-option`. Either enables doc-wide
  // hard line breaks.
  const hardbreaks =
    Object.prototype.hasOwnProperty.call(attributes, 'hardbreaks') ||
    Object.prototype.hasOwnProperty.call(attributes, 'hardbreaks-option')
  // With hardbreaks enabled, EVERY internal newline becomes a line break,
  // and a trailing " +" before the newline is stripped (still produces break).
  // Without hardbreaks, only " +\n" or " +$" produces a break.
  const rx = hardbreaks ? /(?: \+)?\n/g : / \+(\n|$)/g
  const result: InlineNode[] = []
  for (const node of nodes) {
    if (node.type !== 'text') {
      result.push(node)
      continue
    }
    const text = node.text
    rx.lastIndex = 0
    let lastIndex = 0
    let matched = false
    let m: RegExpExecArray | null
    while ((m = rx.exec(text)) !== null) {
      matched = true
      if (m.index > lastIndex) {
        result.push({ type: 'text', text: text.slice(lastIndex, m.index) })
      }
      result.push({ type: 'break', subtype: 'line' })
      lastIndex = m.index + m[0].length
    }
    if (!matched) {
      result.push(node)
    } else if (lastIndex < text.length) {
      result.push({ type: 'text', text: text.slice(lastIndex) })
    }
  }
  return result
}
