interface AuthBrandProps {
  className?: string
  title?: string
}

export default function AuthBrand({ className, title }: AuthBrandProps) {
  return (
    <section className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <img
        src="/icc-ufba.png"
        alt="Logo do Instituto de Computação da UFBA"
        className="h-auto w-24 object-contain lg:w-28"
      />
      <h1 className="text-center text-lg font-semibold tracking-tight text-gray-800">
        {title ?? "SISSEL - Sistema Seleção"}
      </h1>
    </section>
  )
}
