const inlineQuoted = `
// .basic
[why]#chunky bacon#

// .emphasis
_chunky bacon_

// .emphasis-with-role
[why]_chunky bacon_

// .strong
*chunky bacon*

// .strong-with-role
[why]*chunky bacon*

// .monospaced
\`hello world!\`

// .monospaced-with-role
[why]\`hello world!\`

// .superscript
^super^chunky bacon

// .superscript-with-role
[why]^super^chunky bacon

// .subscript
~sub~chunky bacon

// .subscript-with-role
[why]~sub~chunky bacon

// .mark
#chunky bacon#

// .double
"\`chunky bacon\`"

// .double-with-role
[why]"\`chunky bacon\`"

// .single
'\`chunky bacon\`'

// .single-with-role
[why]'\`chunky bacon\`'

// .asciimath
asciimath:[sqrt(4) = 2]

// .latexmath
latexmath:[C = \alpha + \beta Y^{\gamma} + \epsilon]

// .with-id
[#why]_chunky bacon_

// .mixed-monospace-bold-italic
\`*_monospace bold italic phrase_*\` and le\`\`**__tt__**\`\`ers
`

export default inlineQuoted
