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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  BaseOrcamentariaRequestDTO,
  BaseOrcamentariaResponseDTO,
} from "@/types/baseOrcamentaria";
import {
  getBaseOrcamentariaById,
  atualizarBaseOrcamentaria,
} from "@/services/baseOrcamentariaService";

const formSchema = z.object({
  lancto: z.string().min(1, { message: "Lançamento é obrigatório" }),
  valor: z.number().min(0.01, { message: "Valor é obrigatório" }),
  dtDocto: z.string().min(1, { message: "Data do documento é obrigatória" }),
  dtLancto: z.string().min(1, { message: "Data de lançamento é obrigatória" }),
  ano: z.string().length(4, { message: "O ano deve ter 4 dígitos" }),
  tipo: z.string().min(1, { message: "Tipo é obrigatório" }),
});

const tipos = [
  {
    value: "Receita",
    label: "Receita",
  },
  {
    value: "Despesa",
    label: "Despesa",
  },
];

export default function EditBaseOrcamentariaPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lancto: "",
      valor: 0,
      dtDocto: "",
      dtLancto: "",
      ano: new Date().getFullYear().toString(),
      tipo: "",
    },
  });

  // Carrega os dados da base orçamentária
  useEffect(() => {
    const loadBaseOrcamentaria = async () => {
      try {
        const baseOrcamentaria = await getBaseOrcamentariaById(
          params.id as string
        );

        form.reset({
          lancto: baseOrcamentaria.lancto,
          valor: baseOrcamentaria.valor,
          dtDocto: baseOrcamentaria.dtDocto,
          dtLancto: baseOrcamentaria.dtLancto,
          ano: baseOrcamentaria.ano,
          tipo: baseOrcamentaria.tipo,
        });
      } catch (error) {
        toast({
          title: "Erro",
          description:
            "Não foi possível carregar os dados da base orçamentária",
          variant: "destructive",
        });
        router.push("/base-orcamentaria");
      } finally {
        setIsFetching(false);
      }
    };

    loadBaseOrcamentaria();
  }, [params.id, form, router, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const requestData: BaseOrcamentariaRequestDTO = {
        idLancto: Number(params.id),
        lancto: values.lancto,
        valor: values.valor,
        dtDocto: values.dtDocto,
        dtLancto: values.dtLancto,
        ano: values.ano,
        tipo: values.tipo,
      };

      await atualizarBaseOrcamentaria(params.id as string, requestData);
      toast({
        title: "Sucesso",
        description: "Base orçamentária atualizada com sucesso",
      });
      router.push("/base-orcamentaria");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a base orçamentária",
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
          Editar Base Orçamentária
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="lancto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lançamento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Número do lançamento"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? "" : parseFloat(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dtDocto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data do Documento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dtLancto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Lançamento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder="Selecione o tipo"
                                
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tipos?.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
              <p>Edite os campos para atualizar a base orçamentária.</p>
              <p>
                <strong>Campos obrigatórios:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Número do lançamento</li>
                <li>Valor</li>
                <li>Data do documento</li>
                <li>Data de lançamento</li>
                <li>Ano</li>
                <li>Tipo</li>
              </ul>
              <p className="mt-4">
                <strong>Dica:</strong> Mantenha os dados atualizados para
                garantir a precisão das informações orçamentárias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
