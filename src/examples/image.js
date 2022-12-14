const image = `
// .basic
image::sunset.jpg[]

// .with-alt-text
image::sunset.jpg[Shining sun]

// .with-align
image::sunset.jpg[align="center"]

// .with-float
image::sunset.jpg[float="right"]

// .with-dimensions
image::sunset.jpg[Shining sun, 300, 200]

// .with-link
image::sunset.jpg[link="http://www.flickr.com/photos/javh/5448336655"]

// .with-title
.A mountain sunset
image::sunset.jpg[]

// .with-id
[[img-sunset]]
image::sunset.jpg[]

// .with-roles
image::sunset.jpg[role="right text-center"]
`

export default image
