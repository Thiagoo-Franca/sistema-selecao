interface SectionContentProps {
  title: string
  content: {
    label: string
    value: string | number | boolean | Date | null | undefined
    link?: boolean
  }[]
  link?: boolean
}

export default function SectionContent({ title, content, link }: SectionContentProps): JSX.Element {
  return (
    <section>
      <h2 className="text-md font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 p-2 md:grid-cols-3">
        {content.map((item, index) => {
          const isLink = item.link ?? link
          return (
            <div key={index}>
              <h4 className="text-sm text-gray-500">{item.label}</h4>
              {isLink && item.value ? (
                <a
                  href={String(item.value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Ver
                </a>
              ) : (
                <h3 className="font-semibold">
                  {item.value ? String(item.value) : "Não informado"}
                </h3>
              )}
            </div>
          )
        })}
      </div>
      <hr className="my-4" />
    </section>
  )
}
