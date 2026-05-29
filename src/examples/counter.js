// `{counter:name}` outputs an incrementing document-wide counter (starting
// at 1, or a seed); `{counter2:name}` increments silently. Values increment
// in source order, including across section titles.
const counter = `
= Document

== Act {counter:acts}: Opening
First.

== Act {counter:acts}: Middle
Second.

Step {counter:steps}, step {counter:steps}, seeded {counter:n:5}, next {counter:n}.
`

export default counter
