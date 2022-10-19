const inlineAnchor = [
  `[[bookmark-a]] Inline anchors make arbitrary content referenceable.

// .xref
The section <<page-break>> describes how to add a page break.

// .xref-interdoc
The section <<manual.adoc#page-break>> describes how to add a page break.

// .xref-with-text
The section <<page-break, Page break>> describes how to add a page break.

// .xref-resolved-text
Refer to <<Section A>>.

== Section A

// .xref-reftext
Refer to <<install>>.

[#install, reftext="Installation Procedure"]
== Installation`,

  `// .xref-xrefstyle
// Supported since Asciidoctor 1.5.6.
:sectnums:
:section-refsig: Sec.
:xrefstyle: short
Refer to <<install>>.

[[install]]
== Installation

// .bibref
// This is an item (anchor) in the bibliography, not a link to it.
[bibliography]
* [[[prag]]] Andy Hunt & Dave Thomas. The Pragmatic Programmer

// .bibref-with-text
// Supported since Asciidoctor 1.5.6.
// This is an item (anchor) in the bibliography, not a link to it.
[bibliography]
* [[[prag, 1]]] Andy Hunt & Dave Thomas. The Pragmatic Programmer

// .link
http://www.asciidoctor.org

// .link-with-text
irc://irc.freenode.org/#asciidoctor[Asciidoctor IRC channel]

// .link-with-target-blank
link:view-source:asciidoctor.org[Asciidoctor homepage^]

// .link-with-role
:linkattrs:
http://discuss.asciidoctor.org/[*mailing list*, role="green"]
`,
]

export default inlineAnchor
