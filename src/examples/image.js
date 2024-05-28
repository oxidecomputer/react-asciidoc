const image = `
// .basic
image::https://docs.asciidoctor.org/asciidoc/latest/macros/_images/sunset.jpg[]

// .with-alt-text
image::https://docs.asciidoctor.org/asciidoc/latest/macros/_images/sunset.jpg[Shining sun]

// .with-align
image::https://docs.asciidoctor.org/asciidoc/latest/macros/_images/sunset.jpg[align="center"]

// .with-float
image::https://docs.asciidoctor.org/asciidoc/latest/macros/_images/sunset.jpg[float="right"]

// .with-dimensions
image::https://docs.asciidoctor.org/asciidoc/latest/macros/_images/sunset.jpg[Shining sun, 300, 200]

// .with-link
image::https://docs.asciidoctor.org/asciidoc/latest/macros/_images/sunset.jpg[link="http://www.flickr.com/photos/javh/5448336655"]

// .with-title
.A mountain sunset
image::https://docs.asciidoctor.org/asciidoc/latest/macros/_images/sunset.jpg[]

// .with-id
[[img-sunset]]
image::https://docs.asciidoctor.org/asciidoc/latest/macros/_images/sunset.jpg[]

// .with-roles
image::https://docs.asciidoctor.org/asciidoc/latest/macros/_images/sunset.jpg[role="right text-center"]
`

export default image
