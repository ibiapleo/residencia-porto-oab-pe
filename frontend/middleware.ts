import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  exp: number;
  permissions: {
    [module: string]: string[];
  };
}

// Mapeamento de rotas para módulos de permissão
const ROUTE_TO_MODULE_MAP: { [path: string]: string } = {
  '/usuarios': 'modulo_usuarios',
  '/instituicao': 'modulo_instituicoes',
  '/demonstrativo': 'modulo_demonstrativos',
  '/pagamento-cotas': 'modulo_pagamento_cotas',
  '/base-orcamentaria': 'modulo_base_orcamentaria',
  '/transparencia': 'modulo_transparencia',
  '/subseccional': 'modulo_subseccional',
  '/prestacao-contas': 'modulo_prestacao_contas_subseccional',
  '/balancete': 'modulo_balancetes_cfoab',
};

// Aliases para módulos com múltiplos nomes
const MODULE_ALIASES: { [module: string]: string[] } = {
  'modulo_usuarios': ['modulo_usuarios', 'modulo_gestao_usuarios'],
};

// Rotas que requerem apenas permissão de LEITURA
const READ_ONLY_PATHS = [
  /^\/usuarios$/,
  /^\/balancete$/,
  /^\/instituicao$/,
  // ... outros paths de leitura
];

// Rotas que requerem permissão de ESCRITA ou ADMIN
const WRITE_PATHS = [
  /^\/usuarios\/(new|edit)/,
  /^\/balancete\/(new|edit)/,
  // ... outros paths de escrita
];

// Função para verificar permissão considerando aliases
function hasPermissionForModule(userPermissions: string[], module: string): boolean {
  const aliases = MODULE_ALIASES[module] || [module];
  return aliases.some(alias => 
    userPermissions[alias]?.some(p => ['ADMIN', 'ESCRITA', 'LEITURA', 'AUDITORIA'].includes(p))
  );
}

// Função para verificar permissão de escrita considerando aliases
function hasWritePermissionForModule(userPermissions: string[], module: string): boolean {
  const aliases = MODULE_ALIASES[module] || [module];
  return aliases.some(alias => 
    userPermissions[alias]?.some(p => ['ADMIN', 'ESCRITA'].includes(p))
  );
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value;
  const { pathname } = req.nextUrl;

  // Rotas públicas
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    
    if (decoded.exp < Date.now() / 1000) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const module = getModuleFromPath(pathname);
    if (!module) {
      return NextResponse.next();
    }

    // Verifica rotas de leitura
    if (isReadOnlyPath(pathname)) {
      if (!hasPermissionForModule(decoded.permissions, module)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      return NextResponse.next();
    }

    // Verifica rotas de escrita
    if (isWritePath(pathname)) {
      if (!hasWritePermissionForModule(decoded.permissions, module)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Funções auxiliares (mantidas as mesmas)
function isReadOnlyPath(path: string): boolean {
  return READ_ONLY_PATHS.some(regex => regex.test(path));
}

function isWritePath(path: string): boolean {
  return WRITE_PATHS.some(regex => regex.test(path));
}

function getModuleFromPath(path: string): string | null {
  for (const [route, module] of Object.entries(ROUTE_TO_MODULE_MAP)) {
    if (path.startsWith(route)) {
      return module;
    }
  }
  return null;
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|unauthorized).*)',
  ],
};