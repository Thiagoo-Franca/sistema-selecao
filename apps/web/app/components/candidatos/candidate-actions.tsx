import { ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { useNavigate } from "react-router"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu"

interface CandidateActionsProps {
  user: {
    role: "STUDENT" | "TEACHER" | "ADMIN"
  } | null
  candidato: {
    id: string
    tipoCurso: "Doutorado" | "Mestrado"
  }
  handleDelete: () => void
  deleteCandidatoMutation: {
    isPending: boolean
  }
}

export default function CandidateActions({
  user,
  candidato,
  handleDelete,
  deleteCandidatoMutation,
}: CandidateActionsProps) {
  const navigate = useNavigate()

  return (
    <div className="mb-6 flex w-full flex-row justify-between">
      <div className="flex flex-row items-center gap-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
      <div className="flex flex-row items-center gap-2 self-stretch md:gap-4">
        {user?.role === "ADMIN" && (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Outras opções</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="flex flex-col gap-2 p-4">
                    <li>
                      <Button className="w-full bg-white text-black hover:bg-black/10">
                        Editar candidato
                      </Button>
                    </li>
                    <li>
                      <Button
                        className="w-full bg-red-500 hover:bg-red-600"
                        onClick={() => {
                          handleDelete()
                        }}
                        disabled={deleteCandidatoMutation.isPending}
                      >
                        Excluir candidato
                      </Button>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}
        <Button
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() =>
            navigate(`/${candidato.tipoCurso.toLowerCase()}/${candidato.id}/avaliacao`)
          }
        >
          Avaliar
        </Button>
      </div>
    </div>
  )
}
