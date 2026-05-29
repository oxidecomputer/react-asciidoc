// A bibliography anchor id must be a valid XML name: it starts with a letter
// or `_`, never a digit. `[[[22-update]]]` is therefore left as literal text,
// while `[[[edm]]]` is a real bibref (`[<a id="edm"></a>]`). Em-dashes also
// fire between digits (`2190--2020` → `2190&#8212;&#8203;2020`).
const bibrefDigit = `
A reference like [[[edm]]] is a bibliography anchor, but [[[22-update]]] is not.

The range 2190--2020 collapses with an em-dash.
`

export default bibrefDigit
