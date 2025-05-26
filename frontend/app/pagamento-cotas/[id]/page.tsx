"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Pencil, FileText, Calendar, DollarSign, Percent, CheckCircle, XCircle, Clock, Building, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PagamentoCotasResponseDTO } from "@/types/pagamentoCotas";
import { getPagamentoCotasById } from "@/services/pagamentoCotasService";
import Link from "next/link";
import { useInstituicoes } from "@/hooks/useInstituicoes";
import { useTiposDesconto } from "@/hooks/useTiposDesconto";

export default function PagamentoCotasDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [data, setData] = useState<PagamentoCotasResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: instituicoes } = useInstituicoes({ size: 100 });
  const { data: tiposDesconto } = useTiposDesconto({ size: 100 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getPagamentoCotasById(params.id as string);
        setData(response);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do pagamento",
          variant: "destructive",
        });
        router.push("/pagamento-cotas");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.id, router, toast]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getStatusBadge = (pagamento: PagamentoCotasResponseDTO) => {
    if (!pagamento.status) {
      const prevDate = new Date(pagamento.dtPrevEntr);
      const today = new Date();

      if (today > prevDate) {
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="h-4 w-4 mr-1" /> Atrasado
          </Badge>
        );
      }
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <Clock className="h-4 w-4 mr-1" /> Pendente
        </Badge>
      );
    }

    if (!pagamento.dtPagto) {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Clock className="h-4 w-4 mr-1" /> Aguardando pagamento
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-500 hover:bg-green-600">
        <CheckCircle className="h-4 w-4 mr-1" /> Concluído
      </Badge>
    );
  };

  const getInstituicaoNome = (id: number) => {
    return instituicoes?.content.find(i => i.id === id)?.descricao || `Instituição ${id}`;
  };

  const getTipoDescontoNome = (id: number | null) => {
    if (!id) return "-";
    return tiposDesconto?.content.find(t => t.id === id)?.nome || `Tipo ${id}`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Pagamento não encontrado</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            Pagamento de cotas não encontrado
          </h3>
          <p className="text-muted-foreground">
            O pagamento solicitado não foi encontrado ou não existe mais
          </p>
          <Button asChild>
            <Link href="/pagamento-cotas">
              Voltar para a lista
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Detalhes do Pagamento</h2>
        </div>
        
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href={`/pagamento-cotas/edit/${data.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/pagamento-cotas">
              Voltar para lista
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Instituição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getInstituicaoNome(data.instituicaoId)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Referência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.mesReferencia}/{data.ano}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Data Prevista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(data.dtPrevEntr)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Data Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(data.dtPagto)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Valor Dúodecimo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.valorDuodecimo)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Percent className="h-4 w-4 mr-2" />
              Desconto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.valorDesconto)}</div>
            {data.tipoDescontoId && (
              <div className="text-sm text-muted-foreground mt-1">
                {getTipoDescontoNome(data.tipoDescontoId)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Valor Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.valorPago)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg">{getStatusBadge(data)}</div>
          </CardContent>
        </Card>
      </div>

      {data.observacao && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-line">{data.observacao}</div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2">
        <Button asChild variant="outline">
          <Link href={`/pagamento-cotas/edit/${data.id}`}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
        <Button asChild>
          <Link href="/pagamento-cotas">
            Voltar para lista
          </Link>
        </Button>
      </div>
    </div>
  );
}