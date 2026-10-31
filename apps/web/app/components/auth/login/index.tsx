import { useState } from "react"

import ResetPasswordForm from "./reset-password-form"
import LoginForm from "./login-form"
import { RegisterForm } from "./register-form"

export default function Login() {
  const [createAccount, setCreateAccount] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  if (createAccount) {
    return <RegisterForm onBackToLogin={() => setCreateAccount(false)} />
  }

  if (showPasswordReset) {
    return <ResetPasswordForm onBackToLogin={() => setShowPasswordReset(false)} />
  }

  return (
    <LoginForm
      createAccount={() => setCreateAccount(true)}
      onForgotPassword={() => setShowPasswordReset(true)}
    />
  )
}
