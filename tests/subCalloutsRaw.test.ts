import { describe, expect, test } from 'vitest'

import { subCallouts, subCalloutsRaw, subSpecialchars } from '../src/asciidoc/inline/parser'

// `subCalloutsRaw` is the un-escaped counterpart of `subCallouts`: it resolves
// callouts against raw `<N>` markers instead of the specialchars-escaped
// `&lt;N&gt;` markers. Its output should match `subCallouts(subSpecialchars(x))`
// once the escaped delimiters are decoded back to `<`/`>`.
const parity = (src: string, iconsFont: boolean, lineComment?: string) => {
  const ref = subCallouts(subSpecialchars(src), iconsFont, lineComment)
  return ref.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

describe('subCalloutsRaw', () => {
  const cases: string[] = [
    '"Hello world!" // <1>',
    'foo bar <1>',
    'baz <.>\nqux <.>',
    'guarded <!--1-->',
    'auto guard <!--.-->',
    'escaped \\<1>',
    'multi <1> <2>',
    'x = Vec<i32> <1>', // generic earlier on the line is not a callout
    'no callout here <abc>',
  ]

  test.each(cases)('matches escaped subCallouts (icons=font): %j', (src) => {
    expect(subCalloutsRaw(src, true)).toBe(parity(src, true))
  })

  test.each(cases)('matches escaped subCallouts (no icons): %j', (src) => {
    expect(subCalloutsRaw(src, false)).toBe(parity(src, false))
  })

  test('injects conum markup for raw markers (icons=font)', () => {
    expect(subCalloutsRaw('read name # <1>', true)).toBe(
      'read name <i class="conum" data-value="1"></i><b>(1)</b>',
    )
  })

  test('preserves the bare marker without icons', () => {
    expect(subCalloutsRaw('read name <1>', false)).toBe('read name <1>')
  })

  test('honours an explicit line-comment prefix', () => {
    expect(subCalloutsRaw('SELECT 1 -- <1>', true, '--')).toBe(
      'SELECT 1 <i class="conum" data-value="1"></i><b>(1)</b>',
    )
  })

  test('leaves non-callout angle brackets untouched', () => {
    expect(subCalloutsRaw('Map<String, Int> m', true)).toBe('Map<String, Int> m')
  })
})
