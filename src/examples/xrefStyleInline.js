// A per-xref `xref:id[xrefstyle=full|short]` overrides the document xrefstyle
// and computes the link label from the target section (e.g. `Section 2, "…"`),
// rather than printing the literal bracket text `xrefstyle=full`.
const xrefStyleInline = `
= Document
:sectnums:

== Overview

See xref:details[xrefstyle=full] and xref:details[xrefstyle=short].

== Details

Content here.
`

export default xrefStyleInline
