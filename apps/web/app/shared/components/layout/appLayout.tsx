import { Outlet } from "react-router"
import { Header } from "@/shared/components/layout/header"

export default function AppLayout() {
  return (
    <div className="mx-auto w-full max-w-[1440px] p-4 md:p-8">
      <Header className="mb-6" />
      <Outlet />
    </div>
  )
}
