import { describe, expect, test } from 'vitest'

import { parseInline, renderInlineAsString } from '../src/asciidoc/inline'

const html = (src: string) => renderInlineAsString(parseInline(src))

describe('bare email autolinking', () => {
  test('a plain address is linkified', () => {
    expect(html('email@email.com')).toBe(
      '<a href="mailto:email@email.com">email@email.com</a>',
    )
  })

  // A leading `\` is an escape marker: asciidoctor consumes it and emits the
  // address as plain (unlinked) text — it must not keep the backslash.
  test('an escaped address drops the backslash and is not linkified', () => {
    expect(html('\\email@email.com')).toBe('email@email.com')
  })

  // `> : /` belong to preceding content (tag end, scheme, URL path), so the
  // whole match — leading char included — stays literal and unlinked.
  test('a `:` lead char leaves the match untouched', () => {
    expect(html('mailto:email@email.com')).not.toContain('<a')
  })
})
