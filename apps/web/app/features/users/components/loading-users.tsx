import { Header } from "@/shared/components/layout/header"
import { ButtonBack } from "@/shared/ui/button-back"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { Skeleton } from "@/shared/ui/skeleton"

export default function IsLoadingUsers() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ButtonBack className="mb-4" />
      <Card>
        <CardHeader>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
