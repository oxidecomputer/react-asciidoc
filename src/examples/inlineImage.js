const inlineImage = `
// .image
image:linux.svg[]

// .image-with-alt-text
image:linux.svg[Tux]

// .image-with-dimensions
image:linux.svg[Tux, 25, 35]

// .image-with-float
image:linux.svg[float="right"]

// .image-with-link
image:linux.svg[link="http://inkscape.org/doc/examples/tux.svg"]

// .image-with-role
image:linux.svg[role="black"]

// .icon
:icons:
icon:tags[]

// .icon-with-dimensions
:icons:
icon:tags[height=25, width=35]

// .icon-with-float
:icons:
icon:heart[float="right"]

// .icon-with-link
:icons:
icon:download[link="http://rubygems.org/downloads/asciidoctor-1.5.2.gem"]

// .icon-with-title
:icons:
icon:heart[title="I <3 Asciidoctor"]

// .icon-with-role
:icons:
icon:tags[role="blue"]

// .icon-no-icons
icon:tags[]
`

export default inlineImage
