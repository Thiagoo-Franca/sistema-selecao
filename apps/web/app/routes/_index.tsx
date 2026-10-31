import type { Route } from "./+types/_index"
import AuthBrand from "@/components/auth/auth-brand"
import Login from "@/components/auth/login"

export const meta: Route.MetaFunction = () => [
  {
    title: "SISSEL - Login",
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "SISSEL",
      url: "https://sistema-selecao-web.vercel.app",
    },
  },
]

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh animate-gradient-move items-center justify-center bg-white bg-[size:500%_500%] md:bg-[linear-gradient(to_right,_#F0523E,_#F8D65A,_#7BCB61,_#70C8EA)]">
      <div className="flex w-full max-w-md flex-col items-center justify-center gap-6 rounded-lg bg-white p-8 md:p-12 md:shadow-lg">
        <AuthBrand className="flex-shrink-0" title="SISSEL - Sistema Seleção" />
        <section
          aria-labelledby="login-title"
          className="flex w-full flex-col items-center justify-center gap-6"
        >
          <Login />
        </section>
      </div>
    </main>
  )
}
