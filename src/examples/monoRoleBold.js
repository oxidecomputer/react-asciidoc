// Regression: a constrained monospace span wrapping a roled mark span that
// itself contains bold (`` `[.black]#*N*#` ``) used to send the inline
// placeholder resolver into infinite recursion (a nested-parse index
// collision produced a self-referential placeholder). The rebuild now guards
// against cycles. Expected: <code><span class="black"><strong>N</strong></span></code>.
const monoRoleBold = `
// .mono-role-bold
Serial number: \`[.black]#*443231*#\` printed on the bag.

// .plain-role-bold
[.black]#*443229*# is the inventory tag.
`

export default monoRoleBold
