const toc = [
  `
// .in-section
// The toc node is used only with toc::[] macro!
// Actual TOC content is rendered in the outline template, this template
// usually renders just a "border".
= Document Title
:toc: macro

== Introduction

toc::[]

== The Ravages of Writing

=== A Recipe for Potion`,

  `// .in-preamble
= Document Title
:toc: macro

toc::[]

== The Ravages of Writing

=== A Recipe for Potion`,

  `// .with-title
= Document Title
:toc: macro

== Introduction

toc::[title="Table of Adventures"]

== The Ravages of Writing`,

  `// .with-levels
= Document Title
:toc: macro

== Introduction

toc::[levels=2]

== The Ravages of Writing

=== A Recipe for Potion

==== Invisible level`,

  `// .with-id-and-role
= Document Title
:toc: macro

== Introduction

toc::[id="mytoc", role="taco"]

== The Ravages of Writing`,

  `// .doc-without-sections
= Document Title
:toc: macro

toc::[]
`,
]

export default toc
