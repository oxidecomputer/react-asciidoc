// `:hide-uri-scheme:` strips the `scheme://` from a bare URL's DISPLAYED text
// (the href is unchanged). An email at the very start of a quoted span is not
// linkified (the quote tag's `>` is a non-linking context in stock); a
// malformed `link::` (double colon) is left literal.
const inlineUrlOptions = `
= Document
:hide-uri-scheme:

Visit https://www.example.com/path for details.

The address \`support@example.com\` is monospaced, *first@example.com* is bold.

Broken macro link::https://example.com/x[label] stays literal.
`

export default inlineUrlOptions
