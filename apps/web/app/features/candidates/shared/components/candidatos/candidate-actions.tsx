import { useNavigate } from "react-router"
import { Button } from "../../../../../shared/ui/button"
import { ButtonBack } from "../../../../../shared/ui/button-back"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../../../../shared/ui/navigation-menu"

interface CandidateActionsProps {
  user: {
    role: "TEACHER" | "ADMIN"
  } | null
  candidato: {
    id: string
    tipoCurso: "Doutorado" | "Mestrado"
  }
  handleDelete?: () => void
  deleteCandidatoMutation: {
    isPending: boolean
  }
}

export default function CandidateActions({
  user,
  handleDelete,
  deleteCandidatoMutation,
}: CandidateActionsProps) {
  const navigate = useNavigate()

  return (
    <div className="mb-6 flex w-full flex-row justify-between">
      <div className="flex flex-row items-center gap-4">
        <ButtonBack />
      </div>
      <div className="flex flex-row items-center gap-2 self-stretch md:gap-4">
        {user?.role === "ADMIN" && (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="hover:bg-gray-50">Outras opções</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="flex flex-col gap-2 p-4">
                    <li>
                      <Button
                        className="w-full bg-red-500 hover:bg-red-600"
                        onClick={() => {
                          handleDelete?.()
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
      </div>
    </div>
  )
}
