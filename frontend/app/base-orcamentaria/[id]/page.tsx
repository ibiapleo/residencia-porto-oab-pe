"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Pencil, FileText, Calendar, DollarSign, Hash, Type, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BaseOrcamentariaResponseDTO } from "@/types/baseOrcamentaria";
import { getBaseOrcamentariaById } from "@/services/baseOrcamentariaService";
import Link from "next/link";

export default function BaseOrcamentariaDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [data, setData] = useState<BaseOrcamentariaResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getBaseOrcamentariaById(params.id as string);
        setData(response);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da base orçamentária",
          variant: "destructive",
        });
        router.push("/base-orcamentaria");
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

  const formatCurrency = (value: number) => {
    if (!value) return "-";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "ativo":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-4 w-4 mr-1" /> Ativo
          </Badge>
        );
      case "inativo":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="h-4 w-4 mr-1" /> Inativo
          </Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-4 w-4 mr-1" /> Pendente
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            <Clock className="h-4 w-4 mr-1" /> Desconhecido
          </Badge>
        );
    }
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
          <h2 className="text-2xl font-bold">Detalhes não encontrados</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            Base orçamentária não encontrada
          </h3>
          <p className="text-muted-foreground">
            A base orçamentária solicitada não foi encontrada ou não existe mais
          </p>
          <Button asChild>
            <Link href="/base-orcamentaria">
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
          <h2 className="text-2xl font-bold">Detalhes da Base Orçamentária</h2>
        </div>
        
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href={`/base-orcamentaria/edit/${data.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/base-orcamentaria">
              Voltar para lista
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Hash className="h-4 w-4 mr-2" />
              Lançamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.lancto}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Valor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.valor)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Data Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(data.dtDocto)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Data Lançamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(data.dtLancto)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Ano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.ano}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Type className="h-4 w-4 mr-2" />
              Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.tipo}</div>
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
            <div className="text-lg">{getStatusBadge(data.status)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              ID do Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">{data.id}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2">
        <Button asChild variant="outline">
          <Link href={`/base-orcamentaria/edit/${data.id}`}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
        <Button asChild>
          <Link href="/base-orcamentaria">
            Voltar para lista
          </Link>
        </Button>
      </div>
    </div>
  );
}