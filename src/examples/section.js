const section = [
  `
// .level1
== Section Level 1

// .level2
=== Section Level 2

// .level3
==== Section Level 3

// .level4
===== Section Level 4

// .level5
====== Section Level 5

// .max-nesting
== Section Level 1

=== Section Level 2

==== Section Level 3

===== Section Level 4

====== Section Level 5

=== Section Level 2

// .with-custom-id
[#foo]
== Section Title

// .with-roles
[.center.red]
== Section Title`,

  `// .sectanchors
:sectanchors:
== Title with anchor`,

  `// .sectlinks
:sectlinks:
== Linked title`,

  `// .sectanchors-and-sectlinks
:sectanchors:
:sectlinks:
== Linked title with anchor`,

  `// .numbered
:numbered:
== Introduction to Asciidoctor

== Quick Starts

=== Usage

==== Using the Command Line Interface

===== Processing Your Content

=== Syntax

== Terms and Concepts`,

  `// .numbered-sectnumlevels-1
:numbered:
:sectnumlevels: 1
== Introduction to Asciidoctor

== Quick Starts

=== Usage

==== Using the Command Line Interface

=== Syntax

== Terms and Concepts

// .book-part-title
// Subsequent level-0 titles are allowed only for doctype book.
= Document Title
:doctype: book

= Part Title

== Section Level 1
`,
]

export default section
