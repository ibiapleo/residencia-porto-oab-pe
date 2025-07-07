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
import { useToast } from "@/hooks/use-toast";
import { criarInstituicao, uploadInstituicao } from "@/services/instituicaoService";
import { InstituicaoRequestDTO } from "@/types/instituicao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileImport } from "@/components/file-import";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Descrição é obrigatória" }),
});

export default function CreateInstituicaoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
    },
  });

  const handleUpload = async (file: File) => {
      return await uploadInstituicao(file);
    };
  
    const handleSuccess = () => {
      toast({
        title: "Sucesso",
        description: "Planilha importada com sucesso!",
      });
  
      router.push("/instituicao");
    };
  
    const handleError = (error: any) => {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o balancete",
        variant: "destructive",
      });
    };
  

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const requestData: InstituicaoRequestDTO = {
        nome: values.nome,
      };
      await criarInstituicao(requestData);
      toast({
        title: "Instituição criada",
        description: "A instituição foi criada com sucesso",
      });
      router.push("/instituicao"); // Ajuste a rota conforme necessário
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a instituição",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <h2 className="text-3xl font-bold tracking-tight">Nova Instituição</h2>
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
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome da instituição"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.back()}
                  >
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
              <p>Preencha os campos para criar uma nova instituição.</p>
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
