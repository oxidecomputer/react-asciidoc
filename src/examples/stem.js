const stem = `
// .asciimath
:stem: asciimath
[stem]
++++
sqrt(4) = 2
++++

// .latexmath
:stem: latexmath
[stem]
++++
C = \alpha + \beta Y^{\gamma} + \epsilon
++++

// .with-title
:stem:
[stem]
.Equation
++++
sqrt(4) = 2
++++

// .with-id-and-role
:stem:
[stem, id="sqrt", role="right"]
++++
sqrt(4) = 2
++++
`

export default stem
