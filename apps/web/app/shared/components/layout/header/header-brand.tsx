import { Link } from "react-router"

export default function HeaderBrand() {
  return (
    <Link
      to="/dashboard"
      className="-ml-1 flex min-h-12 min-w-0 items-center gap-2.5 rounded-lg px-1 py-1 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:opacity-70 sm:hover:opacity-80"
    >
      {/* Decorativa: o nome do sistema ao lado já identifica o link */}
      <img
        src="/icc-ufba.png"
        alt="Instituto de Computação da Universidade Federal da Bahia"
        decoding="async"
        className="h-auto w-8 shrink-0 object-contain md:w-10"
      />
      <span className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
        Sistema de seleção
      </span>
    </Link>
  )
}
