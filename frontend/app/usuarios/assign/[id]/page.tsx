"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { atribuirCargoUsuario, getUsuarioById } from "@/services/usuarioService"
import { useCargo } from "@/hooks/useCargos"
import { Badge } from "@/components/ui/badge"

// Schema de validação do formulário
const formSchema = z.object({
  cargosId: z.array(z.number()).min(1, { message: "Selecione pelo menos um cargo" }),
})

type Usuario = {
  id: string
  name: string
  roles?: number[]
}

type Cargo = {
  id: number
  name: string
  description?: string
}

export default function AtribuirCargosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams()
  const userId = params.id as string
  const { data: cargosResponse } = useCargo({ size: 100 })
  const [isLoading, setIsLoading] = useState(false)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargosAtuais, setCargosAtuais] = useState<Cargo[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cargosId: [],
    },
  })

  // Extrair cargos da resposta da API
  const cargos = Array.isArray(cargosResponse) ? cargosResponse : cargosResponse?.content || []

  useEffect(() => {
    if (userId) {
      carregarUsuario()
    }
  }, [userId])

  async function carregarUsuario() {
    try {
      setIsLoading(true)
      const usuarioData = await getUsuarioById(userId)
      setUsuario(usuarioData)

      // Extrair os cargos atuais do usuário
      const cargosUsuario =
        usuarioData.roles?.map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description,
        })) || []

      setCargosAtuais(cargosUsuario)

      // Definir os valores iniciais do formulário
      form.setValue(
        "cargosId",
        cargosUsuario.map((c: Cargo) => c.id),
      )
    } catch (error) {
      console.error("Erro ao carregar usuário:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do usuário",
        variant: "destructive",
      })
      router.push("/usuarios")
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      if (!userId) {
        throw new Error("ID de usuário inválido")
      }

      // Remove duplicatas e garante que são números
      const cargosParaAtribuir = Array.from(new Set(values.cargosId.map(Number)))

      await atribuirCargoUsuario({
        userId,
        rolesId: cargosParaAtribuir,
      })

      toast({
        title: "Sucesso",
        description: "Cargos atribuídos com sucesso",
      })

      router.push(`/usuarios`)
    } catch (error) {
      console.error("Erro ao atribuir cargos:", error)

      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atribuir os cargos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleCargo = (cargoId: number) => {
    const currentValues = form.getValues("cargosId") || []
    const updatedValues = currentValues.includes(cargoId)
      ? currentValues.filter((id) => id !== cargoId)
      : [...currentValues, cargoId]

    form.setValue("cargosId", updatedValues)
  }

  const handleRemoveCargo = (cargoId: number) => {
    const currentValues = form.getValues("cargosId") || []
    const updatedValues = currentValues.filter((id) => id !== cargoId)
    form.setValue("cargosId", updatedValues)
  }

  const selectedCargos = form.watch("cargosId") || []

  if (isLoading && !usuario) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Atribuir Cargos ao Usuário {usuario?.name || ""}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="cargosId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Selecionar Cargos</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const cargoId = Number(value)
                            if (cargoId > 0) {
                              handleToggleCargo(cargoId)
                            }
                          }}
                          value=""
                          disabled={!cargos?.length}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Selecione um cargo para adicionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background">
                            {cargos?.length ? (
                              cargos.map((cargo) => (
                                <SelectItem
                                  key={cargo.id}
                                  value={cargo.id.toString()}
                                  disabled={selectedCargos.includes(cargo.id)}
                                  className="hover:bg-accent"
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>{cargo.name}</span>
                                    {selectedCargos.includes(cargo.id) && (
                                      <span className="text-xs text-muted-foreground">(Selecionado)</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="0" disabled>
                                Nenhum cargo disponível
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>

                        {/* Cargos Selecionados */}
                        <div className="mt-4">
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Cargos Selecionados ({selectedCargos.length})
                          </label>
                          {selectedCargos.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedCargos.map((cargoId) => {
                                const cargo = cargos?.find((c) => c.id === cargoId)
                                return (
                                  <Badge
                                    key={cargoId}
                                    variant="default"
                                    className="px-3 py-1 text-sm font-medium flex items-center gap-2"
                                  >
                                    {cargo?.name || `Cargo ID: ${cargoId}`}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleRemoveCargo(cargoId)
                                      }}
                                      className="ml-1 rounded-full hover:bg-destructive/20 h-4 w-4 flex items-center justify-center"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhum cargo selecionado</p>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading || selectedCargos.length === 0} className="flex-1">
                    {isLoading ? "Salvando..." : "Salvar Cargos"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Informações do Usuário</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Nome:</p>
                <p className="text-muted-foreground">{usuario?.name}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Cargos Atuais</h3>
            <div className="space-y-2">
              {cargosAtuais.length > 0 ? (
                cargosAtuais.map((cargo) => (
                  <Badge key={cargo.id} variant="outline" className="px-3 py-1 text-sm font-medium block w-fit">
                    {cargo.name}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">Nenhum cargo atribuído</span>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Instruções</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Selecione os cargos no dropdown acima</p>
              <p>• Os cargos selecionados aparecerão como badges</p>
              <p>• Clique no X para remover um cargo</p>
              <p>• Clique em "Salvar Cargos" para confirmar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
