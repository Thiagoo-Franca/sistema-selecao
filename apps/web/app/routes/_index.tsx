import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import type { Route } from "./+types/_index"
import { LoginForm } from "@/components/auth/LoginForm"

export const meta: Route.MetaFunction = () => [{ title: "SISSEL" }]

export default function LandingPage() {
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const { toast } = useToast()

  return (
    <main className="flex h-screen items-center justify-center bg-white from-[#a8edbb] to-[#22d3ee] md:bg-gradient-to-r">
      <div className="flex w-full flex-col gap-6 rounded-lg bg-white p-6 md:h-auto md:w-1/2 md:gap-4 md:shadow-lg lg:w-1/3">
        <section className="flex flex-col items-center justify-center gap-4">
          <img
            src="/icc-ufba.png"
            alt="Logo do Instituto de Computação da UFBA"
            className="h-auto w-24 object-contain lg:w-28"
          />
          <h1 className="text-center text-2xl text-lg font-semibold tracking-tight text-gray-800">
            SISSEL - Sistema Seleção
          </h1>
        </section>
        <section aria-labelledby="login-title" className="flex w-full items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  )
}
