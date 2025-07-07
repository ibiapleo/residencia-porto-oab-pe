"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Pencil, 
  FileText, 
  Calendar, 
  DollarSign, 
  Percent, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building,
  FileSearch,
  CalendarCheck,
  CalendarX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PrestacaoContasSubseccionalResponseDTO } from "@/types/prestacaoContas";
import { getPrestacaoContasById } from "@/services/prestacaoContasService";
import Link from "next/link";

export default function PrestacaoContasDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [data, setData] = useState<PrestacaoContasSubseccionalResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getPrestacaoContasById(params.id as string);
        setData(response);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da prestação de contas",
          variant: "destructive",
        });
        router.push("/prestacao-contas");
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

  const getStatusBadge = (prestacao: PrestacaoContasSubseccionalResponseDTO) => {
    if (!prestacao.dtEntrega) {
      const prevDate = new Date(prestacao.dtPrevEntr);
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

    if (!prestacao.dtPagto) {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Clock className="h-4 w-4 mr-1" /> Entregue
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-500 hover:bg-green-600">
        <CheckCircle className="h-4 w-4 mr-1" /> Concluído
      </Badge>
    );
  };

  if (!data) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Prestação não encontrada</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            Prestação de contas não encontrada
          </h3>
          <p className="text-muted-foreground">
            A prestação solicitada não foi encontrada ou não existe mais
          </p>
          <Button asChild>
            <Link href="/prestacao-contas">
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
          <h2 className="text-2xl font-bold">Detalhes da Prestação de Contas</h2>
        </div>
        
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href={`/prestacao-contas/edit/${data.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/prestacao-contas">
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
              Subseccional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.subseccional}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileSearch className="h-4 w-4 mr-2" />
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
              <Percent className="h-4 w-4 mr-2" />
              Tipo de Desconto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.tipoDesconto || "-"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarCheck className="h-4 w-4 mr-2" />
              Previsão de Entrega
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
              Data de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(data.dtEntrega) || "-"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarX className="h-4 w-4 mr-2" />
              Data de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(data.dtPagto) || "-"}</div>
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
              <DollarSign className="h-4 w-4 mr-2" />
              Valor Desconto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.valorDesconto)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Protocolo SGD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.protocoloSGD || "-"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
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
    </div>
  );
}