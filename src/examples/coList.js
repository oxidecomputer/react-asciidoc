const coList = `
// .basic
// This example should assert only callouts list below the code listing.
// For callouts inside the listing is responsible inline_callout.
[source, ruby]
----
require 'sinatra' // <1>

get '/hi' do  # <2>
  "Hello World!" ;; <3>
end
----
<1> Library import
<2> URL mapping
<3> Content for response

// .with-title
// This example should assert only callouts list below the code listing.
// For callouts inside the listing is responsible inline_callout.
[source, ruby]
----
require 'sinatra' // <1>

get '/hi' do  # <2>
  "Hello World!" ;; <3>
end
----
.Description
<1> Library import
<2> URL mapping
<3> Content for response

// .with-id-and-role
// This example should assert only callouts list below the code listing.
// For callouts inside the listing is responsible inline_callout.
[source, ruby]
----
require 'sinatra' // <1>

get '/hi' do  # <2>
  "Hello World!" ;; <3>
end
----
[#call.sinatra]
<1> Library import
<2> URL mapping
<3> Content for response
`

export default coList
