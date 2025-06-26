# Configuração de Autenticação - Quadra Fácil

## Visão Geral

Este projeto implementa um sistema de autenticação completo usando NextAuth.js com as seguintes funcionalidades:

- ✅ Login com email/senha
- ✅ Login com Google OAuth
- ✅ Proteção de rotas com middleware
- ✅ Validação persistente no banco de dados
- ✅ Sessões JWT seguras
- ✅ Redirecionamento automático
- ✅ Contexto de autenticação global

## Configuração Necessária

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/quadra_facil"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

### 2. Gerar NEXTAUTH_SECRET

Execute o seguinte comando para gerar uma chave secreta segura:

```bash
openssl rand -base64 32
```

### 3. Configurar Google OAuth (Opcional)

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ 
4. Vá para "Credenciais" e crie um novo "ID do Cliente OAuth 2.0"
5. Configure as URIs de redirecionamento:
   - `http://localhost:3000/api/auth/callback/google` (desenvolvimento)
   - `https://seudominio.com/api/auth/callback/google` (produção)

## Estrutura de Arquivos

```
src/
├── lib/
│   ├── authOptions.ts          # Configuração do NextAuth
│   └── prisma.ts              # Cliente Prisma
├── context/
│   └── AuthContext.tsx        # Contexto de autenticação
├── components/
│   ├── ProtectedRoute.tsx     # Componente de proteção de rotas
│   └── LoadingSpinner.tsx     # Componente de loading
├── hooks/
│   └── useRequireAuth.ts      # Hook para verificar autenticação
├── utils/
│   └── authMiddleware.ts      # Middleware para APIs
└── app/
    ├── components/
    │   ├── AppLayout.tsx      # Layout principal com logout
    │   └── Providers.tsx      # Providers do NextAuth
    ├── login/
    │   └── page.tsx           # Página de login
    └── dashboard/
        └── page.tsx           # Página protegida
```

## Como Usar

### 1. Proteger uma Página

```tsx
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MinhaPagina() {
  return (
    <ProtectedRoute>
      <AppLayout>
        {/* Conteúdo da página */}
      </AppLayout>
    </ProtectedRoute>
  );
}
```

### 2. Usar o Hook de Autenticação

```tsx
import { useAuth } from "@/context/AuthContext";

export default function MeuComponente() {
  const { user, loading, logout } = useAuth();
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      <p>Olá, {user?.name}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

### 3. Proteger uma API

```tsx
import { protect } from "@/utils/authMiddleware";

export async function GET(req: NextRequest) {
  const user = await protect(req);
  
  if (user instanceof NextResponse) {
    return user; // Retorna erro de autenticação
  }
  
  // Usuário autenticado, continuar com a lógica
  return NextResponse.json({ data: "dados protegidos" });
}
```

## Funcionalidades Implementadas

### ✅ Autenticação Persistente
- Validação contínua no banco de dados
- Sessões JWT com expiração configurável (30 dias)
- Verificação automática de validade do token

### ✅ Proteção de Rotas
- Middleware global para rotas protegidas
- Componente `ProtectedRoute` para páginas individuais
- Redirecionamento automático para login

### ✅ Gerenciamento de Estado
- Contexto global de autenticação
- Loading states durante verificações
- Tratamento de erros centralizado

### ✅ Segurança
- Validação de senha com bcrypt
- Tokens JWT seguros
- Verificação de existência do usuário no banco

### ✅ UX/UI
- Loading spinners durante verificações
- Mensagens de erro claras
- Redirecionamento automático
- Logout funcional no layout

## Solução de Problemas

### Problema: Usuário é deslogado ao mudar de página

**Solução:** O middleware global e o contexto de autenticação agora validam a sessão em cada navegação e verificam se o usuário ainda existe no banco de dados.

### Problema: Sessão expira inesperadamente

**Solução:** 
- Sessões configuradas para 30 dias
- Validação persistente no banco a cada requisição
- Refresh automático do token JWT

### Problema: Erro de autenticação nas APIs

**Solução:** Use o middleware `protect()` em todas as rotas de API que precisam de autenticação.

## Próximos Passos

1. **Adicionar Roles/Permissões**: Implementar sistema de roles no schema do Prisma
2. **Refresh Token**: Implementar refresh automático de tokens
3. **Logs de Auditoria**: Adicionar logs de login/logout
4. **2FA**: Implementar autenticação de dois fatores
5. **Rate Limiting**: Adicionar limitação de tentativas de login

## Comandos Úteis

```bash
# Gerar chave secreta
openssl rand -base64 32

# Verificar variáveis de ambiente
echo $NEXTAUTH_SECRET

# Testar conexão com banco
npx prisma db push

# Gerar cliente Prisma
npx prisma generate
``` 