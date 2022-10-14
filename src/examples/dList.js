const dList = `
// .basic
Asciidoctor:: An implementation of the AsciiDoc processor in Ruby.
Asciidoc::
  A text document format for writing notes, documentation, articles, books,
  ebooks, slideshows, web pages, man pages and blogs.

// .basic-block
About::
* An implementation of the AsciiDoc processor in Ruby.
* Fast text processor and publishing toolchain.

Authors::
Asciidoctor is lead by Dan Allen and Sarah White and has received contributions
from many other individuals in Asciidoctor’s awesome community.
+
AsciiDoc was started by Stuart Rackham.

// .basic-missing-description
Definition without a description::

// .basic-with-title
.Asciidoctor
License:: MIT

// .basic-with-id-and-role
[#licenses.open]
License:: MIT

// .qanda
[qanda]
What is Asciidoctor?::
  An implementation of the AsciiDoc processor in Ruby.
What is the answer to the Ultimate Question?:: 42

// .qanda-block
[qanda]
What is Asciidoctor?::
* An implementation of the AsciiDoc processor in Ruby.
* Fast text processor and publishing toolchain.

Who is behind Asciidoctor?::
Asciidoctor is lead by Dan Allen and Sarah White and has received contributions
from many other individuals in Asciidoctor’s awesome community.
+
AsciiDoc was started by Stuart Rackham.

// .qanda-missing-answer
[qanda]
Who knows the answer?::

// .qanda-with-title
[qanda]
.The most important questions
What is the answer to the Ultimate Question?:: 42

// .qanda-with-id-and-role
[qanda, id=faq, role=galaxy]
What is the answer to the Ultimate Question?:: 42

// .horizontal
[horizontal]
Hard drive:: Permanent storage for operating system and/or user files.
RAM:: Temporarily stores information the CPU uses during operation.

// .horizontal-with-dimensions
[horizontal, labelwidth="20", itemwidth="50%"]
Hard drive:: Permanent storage for operating system and/or user files.
RAM:: Temporarily stores information the CPU uses during operation.

// .horizontal-with-title
[horizontal]
.Computer terminology for noobs
Hard drive:: Permanent storage for operating system and/or user files.
RAM:: Temporarily stores information the CPU uses during operation.

// .horizontal-with-id-and-role
[horizontal, id=computer, role=terms]
Hard drive:: Permanent storage for operating system and/or user files.
RAM:: Temporarily stores information the CPU uses during operation.

// .mixed
Operating Systems::
  Linux:::
    . Fedora
      * Desktop
    . Ubuntu
      * Desktop
      * Server
  BSD:::
    . FreeBSD
    . NetBSD

Cloud Providers::
  PaaS:::
    . OpenShift
    . CloudBees
  IaaS:::
    . Amazon EC2
    . Rackspace
`

export default dList
