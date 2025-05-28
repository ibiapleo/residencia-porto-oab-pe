"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  atribuirCargoUsuario,
  getUsuarioById,
} from "@/services/usuarioService";
import { useCargo } from "@/hooks/useCargos";
import { Badge } from "@/components/ui/badge";

// Schema de validação do formulário
const formSchema = z.object({
  cargosId: z
    .array(z.number())
    .min(1, { message: "Selecione pelo menos um cargo" }),
});

export default function AtribuirCargosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const userId = params.id as string;
  const { data: cargos } = useCargo({ size: 100 });
  const [isLoading, setIsLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [cargosAtuais, setCargosAtuais] = useState<
    { id: number; name: string }[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cargosId: [],
    },
  });

  useEffect(() => {
    if (userId) {
      carregarUsuario();
    }
  }, [userId]);

  async function carregarUsuario() {
    try {
      setIsLoading(true);
      const usuarioData = await getUsuarioById(userId);
      setUsuario(usuarioData);

      // Extrai os cargos atuais do usuário com nome e id
      const cargosUsuario =
        usuarioData.roles?.map((cargo: any) => ({
          id: cargo.id,
          name: cargo.name,
        })) || [];

      setCargosAtuais(cargosUsuario);

      // Define os valores iniciais do formulário
      form.setValue(
        "cargosId",
        cargosUsuario.map((c) => c.id)
      );
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do usuário",
        variant: "destructive",
      });
      router.push("/usuarios");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      if (!userId) {
        throw new Error("ID de usuário inválido");
      }

      // Remove duplicatas e garante que são números
      const cargosParaAtribuir = Array.from(
        new Set(values.cargosId.map(Number))
      );

      await atribuirCargoUsuario({
        userId, // Enviado como string
        rolesId: cargosParaAtribuir,
      });

      toast({
        title: "Sucesso",
        description: "Cargos atribuídos com sucesso",
      });

      router.push(`/usuarios/${userId}`);
    } catch (error) {
      console.error("Erro ao atribuir cargos:", error);

      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao atribuir os cargos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          Atribuir Cargos ao Usuário {usuario?.name || ""}
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="cargosId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Cargos
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const newValue = Number(value);
                            const currentValues = field.value || [];

                            const updatedValues = currentValues.includes(
                              newValue
                            )
                              ? currentValues.filter((v) => v !== newValue)
                              : [...currentValues, newValue];

                            field.onChange(updatedValues);
                          }}
                          value=""
                          disabled={!cargos?.content?.length}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Selecione os cargos" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background">
                            {cargos?.content?.length ? (
                              cargos.content.map((cargo) => (
                                <SelectItem
                                  key={cargo.id}
                                  value={cargo.id.toString()}
                                  disabled={cargo.id <= 0}
                                  className="hover:bg-accent"
                                >
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={
                                        field.value?.includes(cargo.id) || false
                                      }
                                      readOnly
                                      className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                                    />
                                    <span>{cargo.name}</span>
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
                        <div className="mt-2">
                          {field.value?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {field.value.map((cargoId) => {
                                const cargo = cargos?.content?.find(
                                  (c) => c.id === cargoId
                                );
                                return (
                                  <Badge
                                    key={cargoId}
                                    className="px-3 py-1 text-sm font-medium"
                                  >
                                    {cargo?.name || `Cargo ID: ${cargoId}`}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        field.onChange(
                                          field.value.filter(
                                            (id) => id !== cargoId
                                          )
                                        );
                                      }}
                                      className="ml-2 rounded-full bg-muted hover:bg-muted-foreground/20 h-4 w-4 flex items-center justify-center"
                                    />
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Informações</h3>
            <div className="space-y-4 text-sm">
              <p>
                Selecione os cargos que deseja atribuir ao usuário{" "}
                {usuario?.name || ""}.
              </p>
              <p className="font-medium">Cargos atuais:</p>
              <div className="flex flex-wrap gap-2">
                {cargosAtuais.length > 0 ? (
                  cargosAtuais.map((cargo) => (
                    <Badge
                      key={cargo.id}
                      variant="outline"
                      className="px-3 py-1 text-sm font-medium"
                    >
                      {cargo.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">
                    Nenhum cargo atribuído
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
