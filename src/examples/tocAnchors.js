// The TOC (outline) drops anchor tags from entry text — a TOC entry is itself
// an `<a>`, so a link or inline anchor inside a section title is stripped to
// its inner text in the TOC (but kept in the heading itself).
const tocAnchors = `
= Document
:toc:

== See https://example.com[the docs] for setup
Body.

== Plain heading
Body.
`

export default tocAnchors
