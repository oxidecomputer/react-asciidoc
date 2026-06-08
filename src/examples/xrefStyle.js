// `:xrefstyle:` controls how section/table cross references render. `short`
// → "Section N" / "Table N"; `full` → 'Section N, "Title"'. The default
// (basic) is the plain title — NOT the captioned/numbered title (the number
// only appears in the TOC and headings).
const xrefStyle = `
= Document
:numbered:
:xrefstyle: short

Jump to <<_principles>> and <<tbl-data>>.

== Overview
Body.

== Principles
Body.

[[tbl-data]]
.Measured data
|===
| Name | Value

| a | 1
|===
`

export default xrefStyle
