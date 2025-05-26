"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Pencil, 
  FileText, 
  Calendar, 
  FileBarChart2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarCheck,
  CalendarX,
  Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BalanceteResponseDTO } from "@/types/balancete";
import { getBalanceteById } from "@/services/balanceteService";
import Link from "next/link";

export default function BalanceteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [data, setData] = useState<BalanceteResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getBalanceteById(params.id as string);
        setData(response);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do balancete",
          variant: "destructive",
        });
        router.push("/balancete");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.id, router, toast]);

  const getStatusBadge = (balancete: BalanceteResponseDTO) => {
    if (!balancete.dtEntr) {
      const prevDate = new Date(balancete.dtPrevEntr);
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

    return (
      <Badge className="bg-green-500 hover:bg-green-600">
        <CheckCircle className="h-4 w-4 mr-1" /> Entregue
      </Badge>
    );
  };

  const getPeriodicidadeLabel = (periodicidade: string) => {
    const map: Record<string, string> = {
      MENSAL: "Mensal",
      TRIMESTRAL: "Trimestral",
      SEMESTRAL: "Semestral",
      ANUAL: "Anual",
    };
    return map[periodicidade] || periodicidade;
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
          <h2 className="text-2xl font-bold">Balancete não encontrado</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            Balancete não encontrado
          </h3>
          <p className="text-muted-foreground">
            O balancete solicitado não foi encontrado ou não existe mais
          </p>
          <Button asChild>
            <Link href="/balancete">
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
          <h2 className="text-2xl font-bold">Detalhes do Balancete</h2>
        </div>
        
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href={`/balancete/edit/${data.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/balancete">
              Voltar para lista
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileBarChart2 className="h-4 w-4 mr-2" />
              Demonstrativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.nomeDemonstrativo}</div>
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
              <FileBarChart2 className="h-4 w-4 mr-2" />
              Periodicidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPeriodicidadeLabel(data.periodicidade)}</div>
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
            <div className="text-2xl font-bold">{data.dtPrevEntr}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarX className="h-4 w-4 mr-2" />
              Data de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.dtEntr || "-"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Percent className="h-4 w-4 mr-2" />
              Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.eficiencia || 0}%</div>
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
          <Link href={`/balancete/edit/${data.id}`}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
        <Button asChild>
          <Link href="/balancete">
            Voltar para lista
          </Link>
        </Button>
      </div>
    </div>
  );
}