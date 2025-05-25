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
import { criarTransparencia } from "@/services/transparenciaService";
import { TransparenciaRequestDTO } from "@/types/transparencia";
import { useDemonstrativos } from "@/hooks/useDemonstrativos";

const formSchema = z
  .object({
    demonstrativoNome: z.string({ required_error: "Nome do demonstrativo é obrigatório" }).min(1),
    referencia: z.string({ required_error: "Referência é obrigatória" }).min(1),
    ano: z.string({ required_error: "Ano é obrigatório" }).length(4),
    periodicidade: z.string({ required_error: "Periodicidade é obrigatória" }).min(1),
    dtPrevEntr: z.string({ required_error: "Data prevista é obrigatória" }).min(1),
    dtEntrega: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.dtEntrega) return true;

      const prevDate = new Date(data.dtPrevEntr);
      const entregaDate = new Date(data.dtEntrega);

      return entregaDate >= prevDate;
    },
    {
      message: "A data de entrega não pode ser anterior à data prevista",
      path: ["dtEntrega"],
    }
  );

const periodicidades = [
  { value: "MENSAL", label: "Mensal" },
  { value: "BIMESTRAL", label: "Bimestral" },
  { value: "TRIMESTRAL", label: "Trimestral" },
  { value: "SEMESTRAL", label: "Semestral" },
  { value: "ANUAL", label: "Anual" },
];

export default function NewTransparenciaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { data: demonstrativos, isLoading: isLoadingDemonstrativos } = useDemonstrativos({
    size: 100,
  });

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const requestData: TransparenciaRequestDTO = {
        demonstrativoNome: values.demonstrativoNome,
        referencia: values.referencia,
        ano: values.ano,
        periodicidade: values.periodicidade,
        dtPrevEntr: values.dtPrevEntr,
        dtEntrega: values.dtEntrega || undefined,
      };

      await criarTransparencia(requestData);

      toast({
        title: "Sucesso",
        description: "Registro de transparência criado com sucesso",
      });
      router.push("/transparencia");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o registro de transparência",
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
          Novo Registro de Transparência
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
                  <FormField
                    control={form.control}
                    name="referencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referência</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 1º Trimestre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <FormLabel>Data de Entrega (opcional)</FormLabel>
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
              <p>
                Preencha os campos para registrar um novo demonstrativo de transparência.
              </p>
              <p>
                <strong>Campos obrigatórios:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nome do demonstrativo</li>
                <li>Referência (ex: "1º Trimestre")</li>
                <li>Ano</li>
                <li>Periodicidade</li>
                <li>Data prevista de entrega</li>
              </ul>
              <p>
                <strong>Observações:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>A data de entrega pode ser informada posteriormente</li>
                <li>A referência deve identificar o período do demonstrativo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}