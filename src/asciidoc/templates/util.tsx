import parse from 'html-react-parser'

import type { Asciidoctor } from '~/lib/asciidoctor'

export const Title = ({
  node,
}: {
  node: Asciidoctor.AbstractBlock | Asciidoctor.Block | Asciidoctor.List
}) => (node.hasTitle() ? <div className="title">{parse(node.getTitle() || '')}</div> : null)

export const CaptionedTitle = ({
  node,
}: {
  node: Asciidoctor.Block | Asciidoctor.Block | Asciidoctor.List
}) =>
  node.hasTitle() ? (
    <div className="title">{parse(node.getCaptionedTitle() || '')}</div>
  ) : null

export const getRole = (
  node: Asciidoctor.AbstractBlock | Asciidoctor.Block | Asciidoctor.List,
) => (typeof node.getRole() === 'string' ? node.getRole() : undefined)
