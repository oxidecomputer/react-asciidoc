const verse = `
// .basic
[verse]
The fog comes
on little cat feet.

// .basic-with-attribution
[verse, Carl Sandburg]
The fog comes
on little cat feet.

// .basic-with-attribution-and-citetitle
[verse, Carl Sandburg, two lines from the poem Fog]
The fog comes
on little cat feet.

// .basic-with-title
[verse]
.Poetry
The fog comes
on little cat feet.

// .basic-with-id-and-role
[verse, id="sandburg", role="center"]
The fog comes
on little cat feet.

// .block
[verse]
____
The fog comes
on little cat feet.

It sits looking
over harbor and city
on silent haunches
and then moves on.
____
`

export default verse
