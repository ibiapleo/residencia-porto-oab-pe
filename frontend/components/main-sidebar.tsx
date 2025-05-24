"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  FileText,
  Building,
  Building2,
  FileBarChart,
  Receipt,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Tag,
  AlertCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/authContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MainSidebar() {
  const pathname = usePathname();
  const [openModules, setOpenModules] = useState(true);
  const { permissions, user, logout } = useAuth();

  const hasPermission = (modulo: string) => {
    return Boolean(permissions[modulo]);
  };

  // Verifica se o usuário tem pelo menos uma permissão
  const hasAnyPermission = Object.keys(permissions || {}).length > 0;

  // Lista de módulos disponíveis
  const modules = [
    "modulo_gestao_usuarios",
    "modulo_balancetes_cfoab",
    "modulo_prestacao_contas_subseccional",
    "modulo_subseccional",
    "modulo_instituicoes",
    "modulo_pagamento_cotas",
    "modulo_base_orcamentaria",
    "modulo_transparencia",
    "modulo_demonstrativos",
  ];

  // Verifica se o usuário tem permissão em algum módulo
  const hasModulePermission = modules.some(module => hasPermission(module));

  return (
    <>
      {user && (
        <Sidebar className="border-r border-border">
          <SidebarHeader className="py-4 px-4">
            <Link href="/">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded">
                  <FileText className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold background">OAB Admin</h1>
                  <p className="text-xs text-muted-foreground">
                    Sistema Administrativo
                  </p>
                </div>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="py-4 px-4">
            {!hasAnyPermission ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  Você não possui nenhuma permissão. Se isso deveria ser um erro,
                  entre em contato com a equipe administrativa.
                </AlertDescription>
              </Alert>
            ) : (
              <SidebarMenu>

                {(hasPermission("modulo_gestao_usuarios") || hasPermission("modulo_usuarios")) && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith("/usuarios")}
                    >
                      <Link href="/usuarios">
                        <Users className="h-4 w-4" />
                        <span>Usuários</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {hasModulePermission && (
                  <Collapsible
                    open={openModules}
                    onOpenChange={setOpenModules}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <FileText className="h-4 w-4" />
                          <span>Módulos de Dados</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {hasPermission("modulo_balancetes_cfoab") && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname.includes("/balancete")}
                              >
                                <Link href="/balancete">
                                  <BarChart3 className="h-3 w-3" />
                                  <span>Balancete CFOAB</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}

                          {hasPermission(
                            "modulo_prestacao_contas_subseccional"
                          ) && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname.includes("/prestacao-contas")}
                              >
                                <Link href="/prestacao-contas">
                                  <Receipt className="h-3 w-3" />
                                  <span>Prestação de Contas</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}

                          {hasPermission("modulo_subseccional") && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname.includes("/subseccional")}
                              >
                                <Link href="/subseccional">
                                  <Building className="h-3 w-3" />
                                  <span>Subseccional</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}

                          {hasPermission("modulo_instituicoes") && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname.includes("/instituicao")}
                              >
                                <Link href="/instituicao">
                                  <Building2 className="h-3 w-3" />
                                  <span>Instituições</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}

                          {hasPermission("modulo_pagamento_cotas") && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname.includes("/pagamento-cotas")}
                              >
                                <Link aria-disabled href="/balancete">
                                  <CreditCard className="h-3 w-3" />
                                  <span>Pagamento Cotas</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}

                          {hasPermission("modulo_base_orcamentaria") && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname.includes("/base-orcamentaria")}
                              >
                                <Link aria-disabled href="/base-orcamentaria">
                                  <Tag className="h-3 w-3" />
                                  <span>Base Orçamentária</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}

                          {hasPermission("modulo_transparencia") && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname.includes("/transparencia")}
                              >
                                <Link aria-disabled href="/balancete">
                                  <FileBarChart className="h-3 w-3" />
                                  <span>Transparência</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}

                          {hasPermission("modulo_demonstrativos") && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname.includes("/demonstrativo")}
                              >
                                <Link href="/demonstrativo">
                                  <LayoutDashboard className="h-3 w-3" />
                                  <span>Demonstrativos</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}

                          {hasPermission("modulo_demonstrativos") && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname.includes("/tipos-desconto")}
                              >
                                <Link href="/tipos-desconto">
                                  <Tag className="h-3 w-3" />
                                  <span>Tipos de Desconto</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )}
              </SidebarMenu>
            )}
          </SidebarContent>
          <SidebarFooter className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium">{user?.sub}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Button
                  onClick={() => logout()}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
      )}
    </>
  );
}