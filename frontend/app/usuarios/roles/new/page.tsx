"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";

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
import { criarCargo } from "@/services/cargoService";
import { CargoRequestDTO, Permission } from "@/types/cargo";
import { useFieldArray } from "react-hook-form";

const modules = [
  "modulo_subseccional",
  "modulo_demonstrativos",
  "modulo_instituicoes",
  "modulo_base_orcamentaria",
  "modulo_transparencia",
  "modulo_balancetes_cfoab",
  "modulo_pagamento_cotas",
  "modulo_prestacao_contas_subseccional",
  "modulo_usuarios",
];

const permissionTypes = ["ADMIN", "LEITURA", "ESCRITA"];

const formSchema = z.object({
  name: z.string().min(1, { message: "O nome do cargo é obrigatório" }),
  permissions: z
    .array(
      z.object({
        moduleName: z.string().min(1, { message: "Selecione um módulo" }),
        permissionName: z.enum(["ADMIN", "LEITURA", "ESCRITA"], {
          required_error: "Selecione uma permissão",
        }),
      })
    )
    .min(1, { message: "Adicione pelo menos uma permissão" }),
});

export default function NewCargoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availableModules, setAvailableModules] = useState([...modules]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "permissions",
  });

  const handleAddPermission = () => {
    if (availableModules.length > 0) {
      append({
        moduleName: "",
        permissionName: "LEITURA",
      });
    }
  };

  const handleRemovePermission = (index: number) => {
    const removedModule = form.getValues(`permissions.${index}.moduleName`);
    if (removedModule) {
      setAvailableModules([...availableModules, removedModule]);
    }
    remove(index);
  };

  const handleModuleChange = (index: number, value: string) => {
    const previousValue = form.getValues(`permissions.${index}.moduleName`);

    // Atualiza a lista de módulos disponíveis
    if (previousValue) {
      setAvailableModules([...availableModules, previousValue]);
    }

    // Remove o módulo selecionado da lista de disponíveis
    const newAvailableModules = availableModules.filter(
      (module) => module !== value
    );
    setAvailableModules(newAvailableModules);

    // Atualiza o valor no formulário
    form.setValue(`permissions.${index}.moduleName`, value);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Garantimos que os tipos estão corretos aqui
      const requestData: CargoRequestDTO = {
        name: values.name,
        permissions: values.permissions as Permission[], // Type assertion aqui
      };

      await criarCargo(requestData);

      toast({
        title: "Sucesso",
        description: "Cargo criado com sucesso",
      });
      router.push("/usuarios/roles");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o cargo",
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
        <h2 className="text-3xl font-bold tracking-tight">Novo Cargo</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border shadow-sm p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Administrador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel>Permissões</FormLabel>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-start gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name={`permissions.${index}.moduleName`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={(value) =>
                                    handleModuleChange(index, value)
                                  }
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o módulo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {availableModules
                                      .concat(field.value || [])
                                      .filter(
                                        (value, index, self) =>
                                          self.indexOf(value) === index
                                      )
                                      .map((module) => (
                                        <SelectItem key={module} value={module}>
                                          {module
                                            .replace("modulo_", "")
                                            .replace(/_/g, " ")}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`permissions.${index}.permissionName`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a permissão" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {permissionTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePermission(index)}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {availableModules.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddPermission}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Permissão
                    </Button>
                  )}

                  {form.formState.errors.permissions?.root && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.permissions.root.message}
                    </p>
                  )}
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
                Preencha os campos para criar um novo cargo com as permissões
                específicas.
              </p>
              <p>
                <strong>Campos obrigatórios:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nome do cargo</li>
                <li>Pelo menos uma permissão</li>
              </ul>
              <p className="pt-2">
                <strong>Tipos de permissão:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>ADMIN</strong> - Acesso completo ao módulo
                </li>
                <li>
                  <strong>ESCRITA</strong> - Pode editar e visualizar
                </li>
                <li>
                  <strong>LEITURA</strong> - Apenas visualização
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
