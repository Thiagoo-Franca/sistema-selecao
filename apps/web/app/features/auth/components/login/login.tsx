import { useState } from "react"
import ResetPasswordForm from "./reset-password-form"
import LoginForm from "./login-form"

export default function Login() {
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  if (showPasswordReset) {
    return <ResetPasswordForm onBackToLogin={() => setShowPasswordReset(false)} />
  }

  return <LoginForm onForgotPassword={() => setShowPasswordReset(true)} />
}
