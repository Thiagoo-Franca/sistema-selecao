import AuthBrand from "../components/auth-brand"
import Login from "../components/login/login"
import { SoftGradientBackgroundAnimation } from "@/shared/ui/soft-gradient-background-animation"
import type { Route } from "./+types/loginPage"

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

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-white">
      <SoftGradientBackgroundAnimation className="hidden md:block absolute inset-0 pointer-events-none" />
      <div className="relative flex w-full max-w-md flex-col items-center justify-center gap-6 rounded-lg bg-white p-8 md:p-12 md:shadow-lg">
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
