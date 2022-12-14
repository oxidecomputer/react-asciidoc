const uList = `
// .basic
* Edgar Allen Poe
* Sheri S. Tepper
* Bill Bryson

// .with-title
.Writers
* Edgar Allen Poe
* Sheri S. Tepper
* Bill Bryson

// .with-id-and-role
[#authors.green]
* Edgar Allen Poe
* Sheri S. Tepper
* Bill Bryson

// .max-nesting
* level 1
** level 2
*** level 3
**** level 4
***** level 5
** level 2

// .complex-content
* Every list item has at least one paragraph of content,
  which may be wrapped, even using a hanging indent.
+
Additional paragraphs or blocks are adjoined by putting
a list continuation on a line adjacent to both blocks.
+
list continuation:: a plus sign (\`{plus}\`) on a line by itself

* A literal paragraph does not require a list continuation.

 $ gem install asciidoctor

// .checklist
- [*] checked
- [x] also checked
- [ ] not checked
-     normal list item
`

export default uList
