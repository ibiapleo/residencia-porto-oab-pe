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
import { criarDemonstrativo, uploadDemonstrativo } from "@/services/demonstrativoService";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileImport } from "@/components/file-import";

const formSchema = z.object({
  nome: z
    .string()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
});

export default function NewSubseccionalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
    },
  });

  const handleUpload = async (file: File) => {
    return await uploadDemonstrativo(file);
  };

  const handleSuccess = () => {
    toast({
      title: "Sucesso",
      description: "Planilha importada com sucesso!",
    });

    router.push("/demonstrativo");
  };

  const handleError = (error: any) => {
    toast({
      title: "Erro",
      description:
        error instanceof Error
          ? error.message
          : "Não foi possível importar a planilha",
      variant: "destructive",
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      await criarDemonstrativo({
        nome: values.nome,
      });
      toast({
        title: "Sucesso",
        description: "Demonstrativo criado com sucesso",
      });

      router.push("/demonstrativo");
    } catch (error) {
      console.error(error);
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
          Novo Demonstrativo
        </h2>
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
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Demonstrativo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do Demonstrativo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-5">
                  <a
                    className="flex justify-center items-center text-sm text-muted-foreground hover:cursor-pointer"
                    onClick={() => router.back()}
                  >
                    Cancelar
                  </a>
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
                Preencha os campos para criar uma novo demonstrativo no sistema.
              </p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Importação em lote</CardTitle>
            </CardHeader>
            <CardContent>
              <FileImport
                uploadService={handleUpload}
                onSuccess={handleSuccess}
                onError={handleError}
                templateFileUrl="/templates/balancete-template.xlsx"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
