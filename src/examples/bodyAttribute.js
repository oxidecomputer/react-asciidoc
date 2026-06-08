// A `:name: value` entry AFTER the document body has started is applied by
// asciidoctor only during conversion, so it never appears in `getAttributes()`.
// We pre-scan the source and merge such body-only attributes so `{name}`
// (here used as a link macro target) resolves the same as stock.
const bodyAttribute = `
= Document

Intro paragraph before the attribute is defined.

:guide: https://example.com/best-practices

See {guide}[the guide] for the full details.
`

export default bodyAttribute
