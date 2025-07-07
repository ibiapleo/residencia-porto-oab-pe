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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TransparenciaRequestDTO } from "@/types/transparencia";
import { getTransparenciaById, atualizarTransparencia } from "@/services/transparenciaService";

const formSchema = z.object({
  demonstrativoNome: z.string().min(1, { message: "Nome do demonstrativo é obrigatório" }),
  referencia: z.string().min(1, { message: "Referência é obrigatória" }),
  ano: z.string().length(4, { message: "O ano deve ter 4 dígitos" }),
  periodicidade: z.string().min(1, { message: "Periodicidade é obrigatória" }),
  dtPrevEntr: z.string().min(1, { message: "Data prevista é obrigatória" }),
  dtEntrega: z.string().optional(),
});

const periodicidades = [
  { value: "Mensal", label: "Mensal" },
  { value: "Trimestral", label: "Trimestral" },
  { value: "Semestral", label: "Semestral" },
  { value: "Anual", label: "Anual" },
];

export default function EditTransparenciaPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      demonstrativoNome: "",
      referencia: "",
      ano: new Date().getFullYear().toString(),
      periodicidade: "",
      dtPrevEntr: "",
      dtEntrega: "",
    },
  });

  // Carrega os dados da transparência
  useEffect(() => {
    const loadTransparencia = async () => {
      try {
        const transparencia = await getTransparenciaById(params.id as string);

        form.reset({
          demonstrativoNome: transparencia.nomeDemonstrativo ?? "",
          referencia: transparencia.referencia,
          ano: transparencia.ano,
          periodicidade: transparencia.periodicidade,
          dtPrevEntr: transparencia.dtPrevEntr,
          dtEntrega: transparencia.dtEntrega ?? "",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da transparência",
          variant: "destructive",
        });
        router.push("/transparencia");
      } finally {
        setIsFetching(false);
      }
    };

    loadTransparencia();
  }, [params.id, form, router, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const requestData: TransparenciaRequestDTO = {
        demonstrativoNome: values.demonstrativoNome,
        referencia: values.referencia,
        ano: values.ano,
        periodicidade: values.periodicidade,
        dtPrevEntr: values.dtPrevEntr,
        dtEntrega: values.dtEntrega ?? undefined,
      };

      await atualizarTransparencia(params.id as string, requestData);
      toast({
        title: "Sucesso",
        description: "Transparência atualizada com sucesso",
      });
      router.push("/transparencia");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a transparência",
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
        <h2 className="text-3xl font-bold tracking-tight">
          Editar Demonstrativo de Transparência
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border shadow-sm p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="demonstrativoNome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Demonstrativo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do demonstrativo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="referencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referência</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Janeiro, 1º Trimestre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ano"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano</FormLabel>
                        <FormControl>
                          <Input placeholder="AAAA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="periodicidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Periodicidade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a periodicidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {periodicidades.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dtPrevEntr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Prevista de Entrega</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dtEntrega"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Entrega (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ?? ""}
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
              <p>
                Edite os campos para atualizar o demonstrativo de transparência.
              </p>
              <p>
                <strong>Campos obrigatórios:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nome do demonstrativo</li>
                <li>Referência</li>
                <li>Ano</li>
                <li>Periodicidade</li>
                <li>Data prevista de entrega</li>
              </ul>
              <p className="mt-4">
                <strong>Dica:</strong> A data de entrega pode ser preenchida posteriormente quando ocorrer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}