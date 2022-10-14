const video = `
// .basic
video::video_file.mp4[]

// .with-poster
video::video_file.mp4[poster="sunset.jpg"]

// .with-dimensions
video::video_file.mp4[width=640, height=480]

// .with-start
video::video_file.mp4[start=10]

// .with-end
video::video_file.mp4[end=60]

// .with-options
video::video_file.mp4[options="autoplay, loop, nocontrols"]

// .with-title
.Must watch!
video::video_file.mp4[]

// .with-id-and-role
video::video_file.mp4[id="lindsey", role="watch"]
`

export default video
