// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-muted/40 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-foreground mb-6">Acesso Não Autorizado</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Você não tem permissão para acessar este recurso
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Voltar para a página inicial
        </a>
      </div>
    </div>
  );
}