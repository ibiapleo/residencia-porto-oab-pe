"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
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
  registrarUsuario,
} from "@/services/usuarioService";
import { useCargo } from "@/hooks/useCargos";
import { AtribuicaoRequestDTO } from "@/types/usuario";

// Schema de validação do formulário
const formSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
    username: z
      .string()
      .min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    cargoId: z.number().min(1, { message: "Selecione um cargo válido" }),
    password: z
      .string()
      .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
    confirmarSenha: z.string().min(6, { message: "Confirme a senha" }),
  })
  .refine((data) => data.password === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export default function NovoUsuarioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: cargos } = useCargo({
    size: 100,
  });
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      cargoId: 0,
      password: "",
      confirmarSenha: "",
    },
  });

  // (não precisa mudar o schema pois você quer que o usuário selecione apenas um)

  // Na função onSubmit, modifique a chamada para handleAtribuirCargo:
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { confirmarSenha, cargoId, ...usuarioData } = values;

      if (!cargoId || cargoId <= 0) {
        throw new Error("Selecione um cargo válido antes de continuar");
      }

      const usuarioCriado = await registrarUsuario(usuarioData);

      if (!usuarioCriado?.id) {
        throw new Error("Registro do usuário não retornou ID válido");
      }

      await atribuirCargoUsuario({
        userId: usuarioCriado.id,
        rolesId: [cargoId],
      });

      toast({
        title: "Sucesso",
        description: "Usuário criado e cargo atribuído com sucesso",
      });
      if (!isLoading) {
        router.push("/usuarios");
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);

      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro durante o cadastro",
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
        <h2 className="text-3xl font-bold tracking-tight">Novo Usuário</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border shadow-sm p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome completo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Usuário</FormLabel>
                        <FormControl>
                          <Input placeholder="nome.exemplo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="cargoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={
                            field.value && field.value > 0
                              ? field.value.toString()
                              : ""
                          } // Corrigido aqui
                          disabled={!cargos?.content?.length}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um cargo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cargos?.content?.length ? (
                              cargos.content.map((cargo) => (
                                <SelectItem
                                  key={cargo.id}
                                  value={cargo.id.toString()}
                                  disabled={cargo.id <= 0}
                                >
                                  {cargo.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="0" disabled>
                                Nenhum cargo disponível
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Digite a senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmarSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirme a senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-secondary hover:bg-secondary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Informações</h3>
            <div className="space-y-4 text-sm">
              <p>
                Preencha os campos para registrar um novo usuário no sistema.
              </p>
              <p>
                <strong>Campos obrigatórios:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nome completo</li>
                <li>Email válido</li>
                <li>Cargo</li>
                <li>Senha (mínimo 6 caracteres)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
