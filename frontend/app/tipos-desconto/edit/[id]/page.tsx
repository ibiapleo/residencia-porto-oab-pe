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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getDescontoById, atualizarDesconto } from "@/services/tipoDescontoService";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
});

export default function EditDescontoPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
    },
  });

  // Carrega os dados do desconto
  useEffect(() => {
    const loadDesconto = async () => {
      try {
        const desconto = await getDescontoById(params.id as string);
        form.reset({
          nome: desconto.nome,
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do desconto",
          variant: "destructive",
        });
        router.push("/descontos");
      } finally {
        setIsFetching(false);
      }
    };

    loadDesconto();
  }, [params.id, form, router, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const requestData = {
        nome: values.nome,
      };

      await atualizarDesconto(params.id as string, requestData);
      toast({
        title: "Desconto atualizado",
        description: "O desconto foi atualizado com sucesso",
      });
      router.push("/tipos-desconto");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o desconto",
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
        <h2 className="text-3xl font-bold tracking-tight">Editar Desconto</h2>
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
                      <FormLabel>Nome do Desconto</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome do desconto"
                          {...field}
                          disabled={isFetching}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/descontos")}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading || isFetching}>
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
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
              <p>Edite o nome do desconto conforme necessário.</p>
              <p>
                <strong>Campo obrigatório:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nome do Desconto</li>
              </ul>
              <p className="mt-4">
                <strong>Dica:</strong> Use um nome descritivo que identifique
                claramente o tipo de desconto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
