const table = `
// .basic
|===
| Cell in column 1, row 1 | Cell in column 2, row 1
| Cell in column 1, row 2 | Cell in column 2, row 2
|===

// .with-frame-sides
[frame=sides]
|===
| Cell in column 1, row 1 | Cell in column 2, row 1
|===

// .with-grid-cols
[grid=cols]
|===
| Cell in column 1, row 1 | Cell in column 2, row 1
|===

// .with-float
[float=left]
|===
| Cell in column 1, row 1 | Cell in column 2, row 1
|===

// .with-width
[width=80]
|===
| Cell in column 1, row 1 | Cell in column 2, row 1
|===

// .with-autowidth
[options="autowidth"]
|===
| Cell in column 1, row 1 | Cell in column 2, row 1
|===

// .with-autowidth-and-width
[options="autowidth", width=80]
|===
| Cell in column 1, row 1 | Cell in column 2, row 1
|===

// .with-title
.Table FTW!
|===
| Cell in column 1, row 1 | Cell in column 2, row 1
|===

// .with-id-and-role
[#tabular.center]
|===
| Cell in column 1, row 1 | Cell in column 2, row 1
|===

// .with-header
[options="header"]
|===
| Name of Column 1 | Name of Column 2

| Cell in column 1, row 1 | Cell in column 2, row 1
| Cell in column 1, row 2 | Cell in column 2, row 2
|===

// .with-footer
[options="footer"]
|===
| Cell in column 1, row 1 | Cell in column 2, row 1
| Cell in column 1, row 2 | Cell in column 2, row 2
| Footer in column 1, row 3 | Footer in column 2, row 3
|===

// .with-cols-width
[cols="50,20,30"]
|===
|Cell in column 1, row 1
|Cell in column 2, row 1
|Cell in column 3, row 1
|===

// .with-cols-halign
[cols="<,^,>"]
|===
|Cell in column 1, row 1
|Cell in column 2, row 1
|Cell in column 3, row 1
|===

// .with-cols-valign
[cols=".<,.^,.>"]
|===
|Cell in column 1, row 1
|Cell in column 2, row 1
|Cell in column 3, row 1
|===

// .with-cols-styles
[cols="a,e,h,l,m,s"]
|===
|image::sunset.jpg[AsciiDoc content]
|Emphasized text
|Styled like a header
|Literal block
|Monospaced text
|Strong text
|===

// .colspan
|===

| Cell in column 1, row 1 | Cell in column 2, row 1 | Cell in column 3, row 1

2+|Content in a single cell that spans columns 1 and 3 | Cell in column 3, row 1

|===

// .rowspan
|===

| Cell in column 1, row 1 | Cell in column 2, row 1 | Cell in column 3, row 1

.2+|Content in a single cell that spans rows 2 and 3

| Cell in column 2, row 2 | Cell in column 3, row 2

| Cell in column 2, row 3 | Cell in column 3, row 3
|===

// .cell-with-paragraphs
|===

|Single paragraph on row 1

|First paragraph on row 2

Second paragraph on row 2
|===

// .aligns-per-cell
[cols="3"]
|===
^|Prefix the +{vbar}+ with +{caret}+ to center content horizontally
<|Prefix the +{vbar}+ with +<+ to align the content to the left horizontally
>|Prefix the +{vbar}+ with +>+ to align the content to the right horizontally

.^|Prefix the +{vbar}+ with a +.+ and +{caret}+ to center the content in the cell vertically
.<|Prefix the +{vbar}+ with a +.+ and +<+ to align the content to the top of the cell
.>|Prefix the +{vbar}+ with a +.+ and +>+ to align the content to the bottom of the cell

3+^.^|This content spans three columns (+3{plus}+) and is centered horizontally (+{caret}+) and vertically (+.{caret}+) within the cell.

|===

// .insane-cells-formatting
// seriously, this isn't readable anymore ;)
|===

2*>m|This content is duplicated across two columns.

It is aligned right horizontally.

And it is monospaced.

.3+^.>s|This cell spans 3 rows. The content is centered horizontally, aligned to the bottom of the cell, and strong.
e|This content is emphasized.

.^l|This content is aligned to the top of the cell and literal.

a|
[source]
puts "This is a source block!"

|===
`

export default table
