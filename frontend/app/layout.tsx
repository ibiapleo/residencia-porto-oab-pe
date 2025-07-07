import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/main-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/context/authContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OAB Admin System",
  description: "Administrative System for the Brazilian Bar Association",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <SidebarProvider>
              <div className="flex w-full min-h-screen">
                <MainSidebar />
                <SidebarInset className="flex-1 overflow-x-hidden">
                  <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                    <SidebarTrigger />
                    <div className="ml-auto flex items-center gap-2">
                      <ThemeToggle />
                    </div>
                  </header>
                  <main className="flex-1">{children}</main>
                </SidebarInset>
              </div>
              <Toaster />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
