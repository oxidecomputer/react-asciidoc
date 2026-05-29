// Natural cross references (`<<Section Title>>`). Asciidoctor matches the
// target EXACTLY against a section's title text (no slugification), and only
// attempts it when the target has a space or uppercase. A target that is a
// registered id wins as a direct hit (even a bare anchor with no label); a
// target that matches nothing is left as the broken `#target` / `[target]`.
const naturalXref = `
= Document

See <<Determinations>>, <<Mitigations and Risks>>, and <<Nope Nope>>.

Also <<deep-link,a reftext, with commas, kept whole>>.

[[deep-link]]A paragraph with an explicit anchor.

== Determinations
Body.

== Mitigations and Risks
Body.
`

export default naturalXref
