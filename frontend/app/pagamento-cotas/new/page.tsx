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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { criarPagamentoCotas } from "@/services/pagamentoCotasService";
import { PagamentoCotasRequestDTO } from "@/types/pagamentoCotas";
import { useInstituicoes } from "@/hooks/useInstituicoes";
import { useTiposDesconto } from "@/hooks/useTiposDesconto";

const formSchema = z
  .object({
    instituicaoId: z
      .string({ required_error: "Selecione uma instituição" })
      .min(1),
    mesReferencia: z.string({ required_error: "Selecione um mês" }).min(1),
    ano: z
      .string({ required_error: "Informe o ano" })
      .length(4, { message: "O ano deve ter 4 dígitos" }),
    dtPrevEntr: z.string({ required_error: "Informe a data prevista" }).min(1),
    dtPagto: z.string().optional(),
    valorDuodecimo: z.number().min(1, { message: "Informe o valor" }),
    valorDesconto: z.number().optional(),
    valorPago: z.number().optional(),
    observacao: z.string().optional(),
    tipoDescontoId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.dtPagto) return true;

      const prevDate = new Date(data.dtPrevEntr);
      const pagtoDate = new Date(data.dtPagto);

      return pagtoDate >= prevDate;
    },
    {
      message: "A data de pagamento não pode ser anterior à data prevista",
      path: ["dtPagto"],
    }
  );

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

export default function NewPagamentoCotasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { data: instituicoes, isLoading: isLoadingInstituicoes } = useInstituicoes({
    size: 100,
  });

  const { data: tiposDesconto, isLoading: isLoadingTiposDesconto } =
    useTiposDesconto({
      size: 100,
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instituicaoId: "",
      mesReferencia: "",
      ano: new Date().getFullYear().toString(),
      dtPrevEntr: "",
      dtPagto: "",
      valorDuodecimo: 0,
      valorDesconto: 0,
      valorPago: 0,
      observacao: "",
      tipoDescontoId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const requestData: PagamentoCotasRequestDTO = {
        instituicaoId: Number(values.instituicaoId),
        mesReferencia: values.mesReferencia,
        ano: values.ano,
        dtPrevEntr: values.dtPrevEntr,
        dtPagto: values.dtPagto || "",
        valorDuodecimo: Number(values.valorDuodecimo),
        valorDesconto: Number(values.valorDesconto) || 0,
        valorPago: Number(values.valorPago) || 0,
        observacao: values.observacao || "",
        tipoDescontoId: values.tipoDescontoId ? Number(values.tipoDescontoId) : 0,
      };

      await criarPagamentoCotas(requestData);

      toast({
        title: "Sucesso",
        description: "Pagamento de cotas criado com sucesso",
      });
      router.push("/pagamento-cotas");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o pagamento de cotas",
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
          Novo Pagamento de Cotas
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border shadow-sm p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="instituicaoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instituição</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingInstituicoes}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoadingInstituicoes
                                    ? "Carregando..."
                                    : "Selecione uma instituição"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {instituicoes &&
                              instituicoes?.content.map((item) => (
                                <SelectItem
                                  key={item.id}
                                  value={item.id.toString()}
                                >
                                  {item.descricao}
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
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Mês" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dtPrevEntr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Prevista de Pagamento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>Data de Pagamento (opcional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>Valor Desconto (opcional)</FormLabel>
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
                    name="tipoDescontoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Desconto (opcional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                            {tiposDesconto &&
                              tiposDesconto.content.map((item) => (
                                <SelectItem
                                  key={item.id}
                                  value={item.nome}
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
                    name="valorPago"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Pago (opcional)</FormLabel>
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
                </div>

                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação (opcional)</FormLabel>
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
                    disabled={isLoading || isLoadingInstituicoes}
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
                Preencha os campos para registrar um novo pagamento de cotas.
              </p>
              <p>
                <strong>Campos obrigatórios:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Instituição</li>
                <li>Mês e Ano de referência</li>
                <li>Data prevista de pagamento</li>
                <li>Valor dúodecimo</li>
              </ul>
              <p>
                <strong>Observações:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Data de pagamento e valor pago podem ser preenchidos posteriormente</li>
                <li>Descontos são opcionais</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}