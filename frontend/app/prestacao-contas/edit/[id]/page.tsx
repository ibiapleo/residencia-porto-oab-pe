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
  getPrestacaoContasById,
  atualizarPrestacaoContas,
} from "@/services/prestacaoContasService";
import { useSubseccionais } from "@/hooks/useSubseccionais";
import { useTiposDesconto } from "@/hooks/useTiposDesconto";
import { PrestacaoContasSubseccionalRequestDTO } from "@/types/prestacaoContas";

const formSchema = z.object({
  subseccional: z.string().min(1, { message: "Subseccional é obrigatória" }),
  mesReferencia: z
    .string()
    .min(1, { message: "Mês de referência é obrigatório" }),
  ano: z.string().length(4, { message: "O ano deve ter 4 dígitos" }),
  dtPrevEntr: z.string().min(1, { message: "Data prevista é obrigatória" }),
  dtEntrega: z.string().nullable(),
  dtPagto: z.string().nullable(),
  valorDuodecimo: z
    .number()
    .min(1, { message: "Valor dúodecimo é obrigatório" }),
  valorDesconto: z.number().optional(),
  protocoloSGD: z.string().optional(),
  observacao: z.string().optional(),
  tipoDescontoId: z.string().optional(),
});

const meses = [
  { value: "Janeiro", label: "Janeiro" },
  { value: "Fevereiro", label: "Fevereiro" },
  { value: "Março", label: "Março" },
  { value: "Abril", label: "Abril" },
  { value: "Maio", label: "Maio" },
  { value: "Junho", label: "Junho" },
  { value: "Julho", label: "Julho" },
  { value: "Agosto", label: "Agosto" },
  { value: "Setembro", label: "Setembro" },
  { value: "Outubro", label: "Outubro" },
  { value: "Novembro", label: "Novembro" },
  { value: "Dezembro", label: "Dezembro" },
];

export default function EditPrestacaoContasPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subseccional: "",
      mesReferencia: "",
      ano: new Date().getFullYear().toString(),
      dtPrevEntr: "",
      dtEntrega: "",
      dtPagto: "",
      valorDuodecimo: 0,
      valorDesconto: 0,
      protocoloSGD: "",
      observacao: "",
      tipoDescontoId: "",
    },
  });

  const { data: subseccionais, isLoading: isLoadingSubseccionais } =
    useSubseccionais({
      size: 100,
    });

  const { data: tiposDesconto, isLoading: isLoadingTiposDesconto } =
    useTiposDesconto({
      size: 100,
    });

  // Carrega os dados da prestação de contas
  useEffect(() => {
    const loadPrestacaoContas = async () => {
      try {
        const prestacao = await getPrestacaoContasById(params.id as string);

        form.reset({
          subseccional: prestacao.subseccional,
          mesReferencia: prestacao.mesReferencia,
          ano: prestacao.ano,
          dtPrevEntr: prestacao.dtPrevEntr,
          dtEntrega: prestacao.dtEntrega ?? "",
          dtPagto: prestacao.dtPagto ?? "",
          valorDuodecimo: prestacao.valorDuodecimo ?? 0,
          valorDesconto: prestacao.valorDesconto ?? 0,
          protocoloSGD: prestacao.protocoloSGD ?? "",
          observacao: prestacao.observacao ?? "",
          tipoDescontoId: prestacao.tipoDescontoId ?? "",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description:
            "Não foi possível carregar os dados da prestação de contas",
          variant: "destructive",
        });
        router.push("/prestacao-contas");
      } finally {
        setIsFetching(false);
      }
    };

    loadPrestacaoContas();
  }, [params.id, form, router, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const requestData: PrestacaoContasSubseccionalRequestDTO = {
        ...values,
        dtEntrega: values.dtEntrega ?? "",
        dtPagto: values.dtPagto ?? "",
        valorDuodecimo: values.valorDuodecimo ?? 0,
        valorDesconto: values.valorDesconto ?? 0,
        protocoloSGD: values.protocoloSGD ?? "",
        observacao: values.observacao ?? "",
        tipoDescontoId: values.tipoDescontoId ?? "",
      };

      await atualizarPrestacaoContas(params.id as string, requestData);
      toast({
        title: "Sucesso",
        description: "Prestação de contas atualizada com sucesso",
      });
      router.push("/prestacao-contas");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a prestação de contas",
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
          Editar Prestação de Contas
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
                    name="subseccional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subseccional</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                          disabled={isLoadingSubseccionais}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoadingSubseccionais
                                    ? "Carregando..."
                                    : "Selecione uma subseccional"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subseccionais?.content.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.subSeccional}
                              >
                                {item.subSeccional}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mesReferencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mês</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o mês" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {meses.map((mes) => (
                                <SelectItem key={mes.value} value={mes.value}>
                                  {mes.label}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="dtPrevEntr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Prevista</FormLabel>
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
                        <FormLabel>Data de Entrega</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="dtPagto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Pagamento</FormLabel>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="valorDuodecimo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Dúodecimo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? 0 : parseFloat(value)
                              );
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valorDesconto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Desconto</FormLabel>
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
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipoDescontoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Desconto</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                          disabled={isLoadingTiposDesconto}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoadingTiposDesconto
                                    ? "Carregando..."
                                    : "Selecione um tipo de desconto"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tiposDesconto?.content.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.nome}
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
                    name="protocoloSGD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protocolo SGD</FormLabel>
                        <FormControl>
                          <Input placeholder="SGD-AAAA-NNNNN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações adicionais"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-secondary hover:bg-secondary/90"
                    disabled={
                      isLoading ||
                      isLoadingSubseccionais ||
                      isLoadingTiposDesconto
                    }
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
                Edite os campos para atualizar a prestação de contas da
                subseccional.
              </p>
              <p>
                <strong>Campos obrigatórios:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Subseccional</li>
                <li>Mês e Ano de referência</li>
                <li>Data prevista de entrega</li>
                <li>Valor dúodecimo</li>
              </ul>
              <p className="mt-4">
                <strong>Dica:</strong> As datas de entrega e pagamento podem ser
                preenchidas posteriormente quando ocorrerem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
