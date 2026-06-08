const bibliographyTest = [
  `// .bibliography-basic
= Document with Bibliography

This document references external sources like RFD 4 <<rfd-4>> and the Pragmatic Programmer <<prag>>.

[bibliography]
== References

* [[[rfd-4]]] RFD 4 User Facing API https://4.rfd.oxide.computer
* [[[prag]]] Andy Hunt & Dave Thomas. The Pragmatic Programmer. Addison-Wesley, 1999.`,

  `// .bibliography-with-text
= Document with Bibliography References

Check out the API specification <<rfd-4>> and also read <<prag, The Pragmatic Programmer>>.

[bibliography]
== External References

* [[[rfd-4]]] RFD 4 User Facing API https://4.rfd.oxide.computer
* [[[prag, 1]]] Andy Hunt & Dave Thomas. The Pragmatic Programmer. Addison-Wesley, 1999.`,

  `// .bibliography-multiple-sections
= Research Document

The methodology follows <<research-method>> while implementation details are in <<rfd-4>>.

== Background

Previous work includes <<prag>> and related studies.

[bibliography]
== References

* [[[rfd-4]]] RFD 4 User Facing API https://4.rfd.oxide.computer
* [[[prag]]] Andy Hunt & Dave Thomas. The Pragmatic Programmer. Addison-Wesley, 1999.
* [[[research-method]]] Smith, John. "Research Methodologies in Software Engineering." Journal of Software, 2020.`,
]

export default bibliographyTest
