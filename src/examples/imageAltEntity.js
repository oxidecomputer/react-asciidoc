// A block image's alt text goes through asciidoctor's substitutions, so a
// straight apostrophe becomes the typographic `&#8217;`. It must be emitted
// verbatim (not via a JSX attribute, which would re-escape the `&`).
const imageAltEntity = `
image::diagram.png[A screenshot of Linear's triage feature]
`

export default imageAltEntity
