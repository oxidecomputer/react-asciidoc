import parse from 'html-react-parser'

export const Title = ({ text }: { text: string | undefined }) =>
  text ? <div className="title">{parse(text)}</div> : null
