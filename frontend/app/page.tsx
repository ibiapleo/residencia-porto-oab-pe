import { FileText } from "lucide-react";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <div className="flex min-h-full  flex-col items-center justify-center bg-muted/40 p-4">
      <h1 className="text-2xl font-bold text-foreground">Bem-vindo ao OAB Admin</h1>
      <p className="text-sm text-muted-foreground">
        Escolha um módulo de dados para começar
      </p>
    </div>
  );
}
