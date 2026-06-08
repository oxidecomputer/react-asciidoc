const inlineFootnote = `
// .basic
Apocalyptic party footnote:[The double hail-and-rainbow level makes my toes tingle.]

// .xref
A bold statement.footnote:disclaimer[Opinions are my own.]
Another outrageous statement

// .xref-unresolved
A bold statement.footnote:disclaimer[]

// .forward-xref
First use footnote:fn1[].
Definition comes later footnote:fn1[This is defined after first use.]
`

export default inlineFootnote
