"use client";

import { useState, useEffect } from "react";
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
import {
  criarPrestacaoContas,
  uploadPrestacaoContas,
} from "@/services/prestacaoContasService";
import { PrestacaoContasSubseccionalRequestDTO } from "@/types/prestacaoContas";
import { useSubseccionais } from "@/hooks/useSubseccionais";
import { useTiposDesconto } from "@/hooks/useTiposDesconto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileImport } from "@/components/file-import";

const formSchema = z
  .object({
    subseccional: z
      .string({ required_error: "Selecione uma subseccional" })
      .min(1),
    mesReferencia: z.string({ required_error: "Selecione um mês" }).min(1),
    ano: z
      .string({ required_error: "Informe o ano" })
      .length(4, { message: "O ano deve ter 4 dígitos" }),
    dtPrevEntr: z.string({ required_error: "Informe a data prevista" }).min(1),
    dtEntrega: z.string().optional(),
    dtPagto: z.string().optional(),
    valorDuodecimo: z.number().min(1, { message: "Informe o valor" }),
    valorDesconto: z.number().optional(),
    protocoloSGD: z.string().optional(),
    observacao: z.string().optional(),
    tipoDescontoId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.dtEntrega) return true;

      const prevDate = new Date(data.dtPrevEntr);
      const entregaDate = new Date(data.dtEntrega);

      return entregaDate <= prevDate;
    },
    {
      message: "A data de entrega não pode ser maior que a data prevista",
      path: ["dtEntrega"],
    }
  )
  .refine(
    (data) => {
      // Validação dtPagto ≤ dtEntrega (se dtEntrega existir)
      if (!data.dtPagto || !data.dtEntrega) return true;

      const entregaDate = new Date(data.dtEntrega);
      const pagtoDate = new Date(data.dtPagto);

      return pagtoDate <= entregaDate;
    },
    {
      message: "A data de pagamento não pode ser maior que a data de entrega",
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

export default function NewPrestacaoContasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { data: subseccionais, isLoading: isLoadingSubseccionais } =
    useSubseccionais({
      size: 100,
    });

  const { data: tiposDesconto, isLoading: isLoadingTiposDesconto } =
    useTiposDesconto({
      size: 100,
    });

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

  const handleUpload = async (file: File) => {
    return await uploadPrestacaoContas(file);
  };

  const handleSuccess = () => {
    toast({
      title: "Sucesso",
      description: "Planilha importada com sucesso!",
    });

    router.push("/prestacao-contas");
  };

  const handleError = (error: any) => {
    toast({
      title: "Erro",
      description:
        error instanceof Error ? error.message : "Não foi importar a planilha",
      variant: "destructive",
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const requestData: PrestacaoContasSubseccionalRequestDTO = {
        subseccional: values.subseccional,
        mesReferencia: values.mesReferencia,
        ano: values.ano,
        dtPrevEntr: values.dtPrevEntr,
        dtEntrega: values.dtEntrega?.toString() ?? "",
        dtPagto: values.dtPagto?.toString() ?? "",
        valorDuodecimo: Number(values.valorDuodecimo),
        valorDesconto: Number(values.valorDesconto),
        protocoloSGD: values.protocoloSGD?.toString() ?? "",
        observacao: values.observacao?.toString() ?? "",
        tipoDescontoId: values.tipoDescontoId?.toString() ?? "",
      };

      await criarPrestacaoContas(requestData);

      toast({
        title: "Sucesso",
        description: "Prestação de contas criada com sucesso",
      });
      router.push("/prestacao-contas");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a prestação de contas",
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
          Nova Prestação de Contas
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
                        <FormLabel>Data de Pagamento</FormLabel>
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
                    disabled={isLoading || isLoadingSubseccionais}
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
                Preencha os campos para registrar uma nova prestação de contas
                de subseccional.
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
