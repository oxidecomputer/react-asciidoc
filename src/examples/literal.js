const literal = `
// .basic
....
error: The requested operation returned error: 1954 Forbidden search for defensive operations manual
absolutely fatal: operation initiation lost in the dodecahedron of doom
would you like to die again? y/n
....

// .with-title
.Die again?
....
error: The requested operation returned error: 1954 Forbidden search for defensive operations manual
absolutely fatal: operation initiation lost in the dodecahedron of doom
would you like to die again? y/n
....

// .with-id-and-role
[#error.fatal]
....
error: The requested operation returned error: 1954 Forbidden search for defensive operations manual
absolutely fatal: operation initiation lost in the dodecahedron of doom
would you like to die again? y/n
....

// .nowrap
[options="nowrap"]
....
error: The requested operation returned error: 1954 Forbidden search for defensive operations manual
absolutely fatal: operation initiation lost in the dodecahedron of doom
would you like to die again? y/n
....
`

export default literal
