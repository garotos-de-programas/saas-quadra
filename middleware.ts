import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Verifica se o usuário está autenticado
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Verifica se a sessão ainda é válida
    if (req.nextauth.token.exp && Date.now() > req.nextauth.token.exp * 1000) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/courts/:path*",
    "/payments/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/api/clients/:path*",
    "/api/payments/:path*",
    "/api/receipts/:path*",
  ],
}; 