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
import { createBalancete, uploadBalancete } from "@/services/balanceteService";
import { useDemonstrativos } from "@/hooks/useDemonstrativos";
import { CreateBalanceteDTO } from "@/types/balancete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileImport } from "@/components/file-import";

const formSchema = z.object({
  demonstrativoNome: z
    .string({ required_error: "Selecione um demonstrativo" })
    .min(1),
  referencia: z.string().min(1, { message: "Referência é obrigatória" }),
  ano: z.string().length(4, { message: "O ano deve ter 4 dígitos" }),
  periodicidade: z.string().min(1, { message: "Periodicidade é obrigatória" }),
  dtPrevEntr: z.string().min(1, { message: "Data prevista é obrigatória" }),
  dtEntr: z.string().optional(),
});

const periodicidades = [
  { value: "Mensal", label: "Mensal" },
  { value: "Bimestral", label: "Bimestral" },
  { value: "Trimestral", label: "Trimestral" },
  { value: "Semestral", label: "Semestral" },
  { value: "Anual", label: "Anual" },
];

const referencias = [
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

export default function NewBalancoCFOABPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (file: File) => {
    return await uploadBalancete(file);
  };

  const handleSuccess = () => {
    toast({
      title: "Sucesso",
      description: "Planilha importada com sucesso!",
    });

    router.push("/balancete");
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      demonstrativoNome: "",
      referencia: "",
      ano: new Date().getFullYear().toString(),
      periodicidade: "",
      dtPrevEntr: "",
      dtEntr: "",
    },
  });

  const { data: demonstrativos, isLoading: isLoadingDemonstrativos } =
    useDemonstrativos({
      size: 100,
    });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const requestData: CreateBalanceteDTO = {
        ...values,
        dtEntr: values.dtEntr ?? null,
      };
      await createBalancete(requestData);
      toast({
        title: "Balancete criado",
        description: "O balancete foi criado com sucesso",
      });
      router.push("/balancete");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o balancete",
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
          Novo Balanço CFOAB
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
                  name="demonstrativoNome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Demonstrativo</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(String(value))}
                        value={field.value}
                        disabled={isLoadingDemonstrativos}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingDemonstrativos
                                  ? "Carregando..."
                                  : "Selecione um demonstrativo"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {demonstrativos &&
                            demonstrativos.content.map((item) => (
                              <SelectItem key={item.id} value={item.nome}>
                                {item.nome}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="referencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referência</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {referencias.map((item) => (
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
                    name="periodicidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Periodicidade</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
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
                    name="dtEntr"
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
              <p>Preencha os campos para registrar um novo balanço CFOAB.</p>
              <p>
                <strong>Campos obrigatórios:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Demonstração</li>
                <li>Referência</li>
                <li>Ano</li>
                <li>Periodicidade</li>
                <li>Data prevista de entrega</li>
                <li>Usuário responsável</li>
              </ul>
              <p className="mt-4">
                <strong>Tipos de demonstração:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Balanço Patrimonial</li>
                <li>Demonstração do Resultado do Exercício</li>
                <li>Fluxo de Caixa</li>
                <li>Demonstração das Mutações do Patrimônio Líquido</li>
                <li>Notas Explicativas</li>
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
