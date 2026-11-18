import { useNavigate } from "react-router"
import { handleDelete } from "@/shared/lib/helpers"

import { Button } from "@/shared/ui/button"
import { ButtonBack } from "@/shared/ui/button-back"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/shared/ui/navigation-menu"

interface CandidateActionsProps {
  isAdmin: boolean
  deleteCandidatoMutation: {
    isPending: boolean
  }
}

export default function CandidateActions({
  isAdmin,
  deleteCandidatoMutation,
}: CandidateActionsProps) {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto mb-6 flex w-full flex-row items-center justify-between">
      <ButtonBack />
      {isAdmin && (
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
                        handleDelete(deleteCandidatoMutation, navigate)
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
  )
}
