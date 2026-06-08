export const Title = ({ text }: { text: string | undefined }) =>
  text ? <div className="title" dangerouslySetInnerHTML={{ __html: text }} /> : null
