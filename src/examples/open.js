const open = `
// .basic
--
An open block can be an anonymous container,
or it can masquerade as any other block.
--

// .basic-with-title
.An open block
--
An open block can be an anonymous container,
or it can masquerade as any other block.
--

// .basic-with-id-and-role
[#open.example]
--
An open block can be an anonymous container,
or it can masquerade as any other block.
--

// .abstract
[abstract]
--
This is an abstract quote block.
--

// .abstract-with-title
[abstract]
.Abstract title is abstract
--
This is an abstract quote block.
Who knows what it really means?
--

// .abstract-with-id-and-role
[abstract, id="open", role="example"]
--
This is an abstract quote block.
Who knows what it really means?
--
`

export default open
