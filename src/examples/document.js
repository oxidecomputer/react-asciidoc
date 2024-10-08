const document = [
  `
// .title
= The Dangerous and Thrilling Documentation Chronicles`,

  `// .title-with-author
= The Dangerous and Thrilling Documentation Chronicles
Kismet Rainbow Chameleon <kismet@asciidoctor.org>`,

  `// .title-with-author-no-email
= The Dangerous and Thrilling Documentation Chronicles
Kismet Rainbow Chameleon`,

  `// .title-with-multiple-authors
= The Dangerous and Thrilling Documentation Chronicles
Kismet Rainbow Chameleon <kismet@asciidoctor.org>; Lazarus het_Draeke <lazarus@asciidoctor.org>`,

  `// .title-with-revnumber
= Document Title
Kismet Chameleon
v1.0`,

  `// .title-with-revdate
= Document Title
Kismet Chameleon
v1.0, 2013-10-02`,

  `// .title-with-revremark
= Document Title
Kismet Chameleon
v1.0, October 2, 2013: First incarnation`,

  `// .footnotes
The hail-and-rainbow protocol can be initiated at five levels: double, tertiary, supernumerary,
supermassive, and apocalyptic party.footnote:rainbow[The double hail-and-rainbow level makes my toes tingle.]
A bold statement.footnote:disclaimer[Opinions are my own.]

Another outrageous statement.footnote:disclaimer`,

  `// .toc
// Actual TOC content is rendered in the outline template, this template
// usually renders just a "border".
= Document Title
:toc:

== Cavern Glow`,

  `// .toc-title
= Document Title
:toc:
:toc-title: Table of Adventures

== Cavern Glow
`,
]

export default document
