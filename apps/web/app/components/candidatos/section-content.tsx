interface SectionContentProps {
  title: string
  content: { label: string; value: string }[]
}

export default function SectionContent({ title, content }: SectionContentProps): JSX.Element {
  return (
    <section>
      <h2 className="text-md font-semibold">{title}</h2>
      <div className="grid grid-cols-3 gap-4 p-2">
        {content.map((item, index) => (
          <div key={index}>
            <h4 className="text-sm text-gray-500">{item.label}</h4>
            <h3 className="font-semibold">{item.value}</h3>
          </div>
        ))}
      </div>
      <hr className="my-4" />
    </section>
  )
}
