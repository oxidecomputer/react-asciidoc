function re(pattern: string, flags?: string): RegExp {
  return new RegExp(pattern, flags)
}

const cgAlpha = 'A-Za-z'
const cgAlnum = 'A-Za-z0-9'
const cgWord = 'A-Za-z0-9_'
const cgBlank = '[ \\t]'
const ccAny = '[^\\n]'
const ccAll = '[\\s\\S]'

export const InlineAnchorRx = re(
  `(\\\\)?(?:\\[\\[([${cgAlpha}_:][${cgWord}\\-:.]*)(?:, *(${ccAny}+?))?\\]\\]|anchor:([${cgAlpha}_:][${cgWord}\\-:.]*)\\[(?:\\]|(${ccAny}*?[^\\\\])\\]))`
)

export const InlineBiblioAnchorRx = re(
  `^\\[\\[\\[([${cgAlpha}_:][${cgWord}\\-:.]*)(?:, *(${ccAny}+?))?\\]\\]\\]`
)

export const InlineEmailRx = re(
  `([\\\\>:/])?[${cgWord}](?:&amp;|[${cgWord}\\-.%+])*@[${cgAlnum}][${cgAlnum}_\\-.]*\\.[a-zA-Z]{2,5}\\b`
)

export const InlineFootnoteMacroRx = re(
  `\\\\?footnote(?:(ref):|:([${cgWord}-]+)?)\\[(?:|(${ccAll}*?[^\\\\]))\\](?!</a>)`,
  'm'
)

export const InlineImageMacroRx = re(
  `\\\\?i(?:mage|con):([^:\\s\\[](?:[^\\n\\[]*[^\\s\\[])?)\\[(|${ccAll}*?[^\\\\])\\]`,
  'm'
)

export const InlineIndextermMacroRx = re(
  `\\\\?(?:(indexterm2?):\\[(${ccAll}*?[^\\\\])\\]|\\(\\((${ccAll}+?)\\)\\)(?!\\)))`,
  'm'
)

export const InlineKbdBtnMacroRx = re(
  `(\\\\)?(kbd|btn):\\[(${ccAll}*?[^\\\\])\\]`,
  'm'
)

export const InlineLinkRx = re(
  `(^|link:|${cgBlank}|&lt;|[>\\(\\)\\[\\];"'])(\\\\?(?:https?|file|ftp|irc)://)(?:([^\\s\\[\\]]+)\\[(|${ccAll}*?[^\\\\])\\]|([^\\s\\[\\]<]*([^\\s,.?!\\[\\]<\\)])))`,
  'm'
)

export const InlineLinkMacroRx = re(
  `\\\\?(?:link|(mailto)):(|[^:\\s\\[][^\\s\\[]*)\\[(|${ccAll}*?[^\\\\])\\]`,
  'm'
)

export const InlineMenuMacroRx = re(
  `\\\\?menu:([${cgWord}]|[${cgWord}&][^\\n\\[]*[^\\s\\[])\\[ *(?:|(${ccAll}*?[^\\\\]))\\]`,
  'm'
)

export const InlineMenuRx = re(
  `\\\\?"([${cgWord}&][^"]*?[ \\n]+&gt;[ \\n]+[^"]*)"`
)

const CG_WORD_FOR_REGEX = `[${cgWord}]`

export const InlinePassRxNonCompat = re(
  `((?:^|[^${cgWord};:\\\\])(?=(\\[)|\\+)|\\\\(?=\\[)|(?=\\\\\\+))(?:\\2(x-|[^\\]]+ x-)\\]|(?:\\[([^\\]]+)\\])?(?=(\\\\)?\\+))(\\5?(\\+|\`)(\\S|\\S${ccAll}*?\\S)\\7)(?!${CG_WORD_FOR_REGEX})`,
  'm'
)

export const InlinePassRxCompat = re(
  `(^|[^\`${cgWord}])(?:(\\Z)()|\\[([^\\]]+)\\](?=(\\\\))?)?(\\5?(\`)([^\`\\s]|[^\`\\s]${ccAll}*?\\S)\\7)(?![\`${cgWord}])`,
  'm'
)

export const InlinePassMacroRx = re(
  `(?:(?:(\\\\?)\\[([^\\]]+)\\])?(\\\\{0,2})(\\+\\+\\+?|\\$\\$)(${ccAll}*?)\\4|(\\\\?)pass:([a-z]+(?:,[a-z-]+)*)?\\[(|${ccAll}*?[^\\\\])\\])`,
  'm'
)

export const InlineStemMacroRx = re(
  `\\\\?(stem|(?:latex|ascii)math):([a-z]+(?:,[a-z-]+)*)?\\[(${ccAll}*?[^\\\\])\\]`,
  'm'
)

export const InlineXrefMacroRx = re(
  `\\\\?(?:&lt;&lt;([${cgWord}#/.:{]${ccAll}*?)&gt;&gt;|xref:([${cgWord}#/.:{]${ccAll}*?)\\[(?:\\]|(${ccAll}*?[^\\\\])\\]))`,
  'm'
)

export const HardLineBreakRx = /^([\s\S]*) \+$/m

export const CalloutSourceRx =
  /((?:\/\/|#|--|;;) ?)?(\\)?&lt;!?(|--)(\d+|\.)\3&gt;(?=(?: ?\\?&lt;!?\3(?:\d+|\.)\3&gt;)*$)/

export const SpecialCharsRx = /[<&>]/g

export const AttributeReferenceRx = re(
  `(\\\\)?\\{([${cgWord}][${cgWord}\\-]*|(set|counter2?):${ccAny}+?)(\\\\)?\\}`
)

export const QuotedTextSniffRx: Record<string, RegExp> = {
  false: /[*_\x60#^~]/,
  true: /[*'_+#^~]/,
}

export const PassSlotRx = /(\d+)/

export const ReplaceableTextRx = /[&']|--|\.\.\.|\([CRT]M?\)/

export const SpecialCharsTr: Record<string, string> = {
  '>': '&gt;',
  '<': '&lt;',
  '&': '&amp;',
}

export const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\\?\(C\)/, '©'],
  [/\\?\(R\)/, '®'],
  [/\\?\(TM\)/, '™'],
  [/(?:[ \n]|^|\\)--(?:[ \n]|$)/, ' — '],
  [/(\p{Alpha})\\?--(?=\p{Alpha})/u, '—​'],
  [/\\?\.\.\./, '…​'],
  [/\\?`'/, '’'],
  [/(\p{Alpha})\\?'(?=\p{Alpha})/u, '’'],
  [/\\?->/, '→'],
  [/\\?=>/, '⇒'],
  [/\\?<-/, '←'],
  [/\\?<=/, '⇐'],
  [
    /\\?(&)amp;((?:[a-zA-Z][a-zA-Z]+\d{0,2}|#\d{1,4}|#x[\da-fA-F][\da-fA-F][\da-fA-F]{0,3});)/,
    '',
  ],
]

export const NORMAL_SUBS = [
  'specialcharacters',
  'quotes',
  'attributes',
  'replacements',
  'macros',
  'post_replacements',
] as const

export const HARD_LINE_BREAK = ' +'

export const ATTR_REF_HEAD = '{'
