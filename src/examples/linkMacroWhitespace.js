// The `link:`/`mailto:` macro target may not be separated from the scheme by
// whitespace, so the literal words "a link:" stay text and only the real
// `link:URL[...]` macro links. A bare `mailto:addr` without `[...]` is left
// plain (any lead char — here `:` — is a non-linking context).
const linkMacroWhitespace = `
= Document

This is how you format a link: link:https://example.com[a link].

Email us at mailto:support@example.com, anytime.
`

export default linkMacroWhitespace
