const outline = `
// .basic
= Document Title
:toc:

== Section 1

== Section 2

=== Section 2.1

==== Section 2.1.1

== Section 3

// .toclevels
= Document Title
:toc:
:toclevels: 1

== Section 1

=== Section 1.1

==== Section 1.1.1

== Section 2

// .numbered
= Document Title
:toc:
:numbered:

== Section 1

:numbered!:

== Unnumbered Section

:numbered:

== Section 2

=== Section 2.1

== Section 3

// .sectnumlevels
= Document Title
:toc:
:toclevels: 3
:numbered:
:sectnumlevels: 1

== Section 1

=== Section 1.1

==== Section 1.1.1

== Section 2
`

export default outline
