import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface DetailItem {
  label: string
  value: string | number | null
  format?: (value: any) => string
}

interface EntityDetailViewProps {
  title: string
  backUrl: string
  editUrl?: string
  items: DetailItem[]
}

export function EntityDetailView({ title, backUrl, editUrl, items }: EntityDetailViewProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" asChild>
            <Link href={backUrl}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        {editUrl && (
          <Button asChild className="bg-secondary hover:bg-secondary/90">
            <Link href={editUrl}>Editar</Link>
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detalhes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">{item.label}</div>
                  <div className="text-sm">
                    {item.value !== null ? (item.format ? item.format(item.value) : item.value) : "-"}
                  </div>
                </div>
                {index < items.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
