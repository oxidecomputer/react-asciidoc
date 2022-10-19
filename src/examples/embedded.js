const embedded = [
  `
// .title
:showtitle:
= The Dangerous and Thrilling Documentation Chronicles`,

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

== Cavern Glow`,

  `// .footnotes
The hail-and-rainbow protocol can be initiated at five levels: double, tertiary, supernumerary,
supermassive, and apocalyptic party.footnote:[The double hail-and-rainbow level makes my toes tingle.]
A bold statement.footnoteref:[disclaimer,Opinions are my own.]

Another outrageous statement.footnoteref:[disclaimer]
`,
]

export default embedded
