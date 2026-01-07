# 🎨 FastFeet Web

Interface web desenvolvida com **React**, **TypeScript** e **Tailwind CSS** para o sistema de gerenciamento de entregas FastFeet.

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Rotas](#-rotas)
- [Componentes](#-componentes)
- [Context API](#-context-api)
- [Estilização](#-estilização)
- [Build](#-build)

## 🛠 Tecnologias

- **React 18** - Biblioteca para interfaces
- **TypeScript** - Superset JavaScript com tipagem
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Biblioteca de ícones
- **Context API** - Gerenciamento de estado

## 📦 Pré-requisitos

- Node.js >= 18
- npm ou yarn
- FastFeet API rodando (backend)

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Editar .env com a URL da API
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3333
```

## 📁 Estrutura do Projeto

```
src/
├── components/              # Componentes reutilizáveis
│   ├── Layout.tsx           # Layout com sidebar e navegação
│   └── ProtectedRoute.tsx   # HOC para proteção de rotas
│
├── contexts/                # Context API
│   └── AuthContext.tsx      # Contexto de autenticação
│
├── pages/                   # Páginas da aplicação
│   ├── SignIn.tsx           # Página de login
│   ├── Dashboard.tsx        # Dashboard com estatísticas
│   ├── Orders.tsx           # Listagem de encomendas
│   ├── NewOrder.tsx         # Cadastro de encomenda
│   ├── EditOrder.tsx        # Edição de encomenda
│   ├── Recipients.tsx       # Listagem de destinatários
│   ├── NewRecipient.tsx     # Cadastro de destinatário
│   ├── EditRecipient.tsx    # Edição de destinatário
│   ├── Deliverymen.tsx      # Listagem de entregadores
│   ├── NewDeliveryman.tsx   # Cadastro de entregador
│   ├── EditDeliveryman.tsx  # Edição de entregador
│   └── DeliverymanOrders.tsx # Área do entregador
│
├── lib/                     # Configurações e utilitários
│   └── axios.ts             # Configuração do Axios
│
├── App.tsx                  # Componente raiz com rotas
├── main.tsx                 # Entry point
└── index.css                # Estilos globais e Tailwind
```

## 🗺️ Rotas

### Rotas Públicas

- `/` - Página de login

### Rotas Admin (Protegidas)

- `/dashboard` - Dashboard com estatísticas
- `/orders` - Listagem de encomendas
- `/new-order` - Cadastro de encomenda
- `/orders/edit/:id` - Edição de encomenda
- `/recipients` - Listagem de destinatários
- `/recipients/new` - Cadastro de destinatário
- `/recipients/edit/:id` - Edição de destinatário
- `/deliverymen` - Listagem de entregadores
- `/deliverymen/new` - Cadastro de entregador
- `/deliverymen/edit/:id` - Edição de entregador

### Rotas Entregador (Protegidas)

- `/my-orders` - Minhas entregas

## 🧩 Componentes

### Layout

Componente principal que envolve as páginas com:
- **Sidebar** responsiva com toggle
- **Menu de navegação** com ícones
- **Informações do usuário**
- **Botão de logout**

```tsx
<Layout>
  <MinhasPaginas />
</Layout>
```

### ProtectedRoute

HOC que protege rotas baseado em autenticação e roles:

```tsx
<ProtectedRoute allowedRoles={['ADMIN']}>
  <MinhasPaginas />
</ProtectedRoute>
```

## 🔐 Context API

### AuthContext

Gerencia autenticação e estado do usuário:

```tsx
const { isAuthenticated, user, signIn, signOut } = useAuth();

// Login
await signIn({ cpf: '00000000000', password: 'admin123' });

// Logout
signOut();

// Usuário atual
console.log(user.name, user.role);
```

**Funcionalidades:**
- Login com CPF e senha
- Armazenamento de token no localStorage
- Configuração automática do header Authorization
- Redirecionamento baseado em role
- Persistência de sessão

## 🎨 Estilização

### Tailwind CSS

O projeto utiliza Tailwind CSS com configuração customizada:

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        'brand-purple': '#7159c1',
      },
    },
  },
}
```

### Cores do Projeto

- **Brand Purple**: `#7159c1` - Cor principal
- **Status Colors**:
  - Aguardando: Amarelo (`yellow-100`, `yellow-700`)
  - Em Trânsito: Azul (`blue-100`, `blue-700`)
  - Entregue: Verde (`green-100`, `green-700`)
  - Devolvida: Vermelho (`red-100`, `red-700`)

### Classes Comuns

```tsx
// Botão primário
className="bg-brand-purple text-white px-4 py-2 rounded hover:bg-violet-600"

// Card
className="bg-white p-6 rounded-lg shadow-lg"

// Input
className="border border-gray-300 rounded px-3 py-2 w-full"

// Badge de status
className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"
```

## 🔧 Axios Configuration

O Axios está configurado para:
- Base URL da API
- Interceptor para adicionar token JWT automaticamente
- Tratamento de erros 401 (logout automático)

```typescript
// lib/axios.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fastfeet:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 📱 Responsividade

O layout é totalmente responsivo:
- **Mobile**: Sidebar colapsável
- **Tablet**: Grid adaptativo
- **Desktop**: Layout completo com sidebar fixa

Classes responsivas:
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
```

## 🚀 Executando o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

A aplicação estará disponível em `http://localhost:5173`

## 🏗️ Build

```bash
# Criar build de produção
npm run build

# A build será gerada na pasta dist/
```

### Variáveis de build

As variáveis de ambiente com prefixo `VITE_` são incluídas no build.

## 📝 Como Adicionar uma Nova Página

1. Criar arquivo na pasta `pages/`:
```tsx
// src/pages/MinhaPage.tsx
export function MinhaPage() {
  return (
    <div>Minha Nova Página</div>
  );
}
```

2. Adicionar rota em `App.tsx`:
```tsx
import { MinhaPage } from './pages/MinhaPage';

<Route 
  path="/minha-rota" 
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Layout><MinhaPage /></Layout>
    </ProtectedRoute>
  } 
/>
```

3. Adicionar item no menu (opcional) em `Layout.tsx`:
```tsx
const menuItems = [
  { icon: Icon, label: 'Minha Página', path: '/minha-rota', emoji: '🎯' },
];
```

## 🎯 Credenciais de Teste

### Admin
- **CPF**: `00000000000`
- **Senha**: `admin123`

### Entregador
- **CPF**: `11111111111`
- **Senha**: `entregador123`

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvido por

**Hyarlei Silva** - [GitHub](https://github.com/hyarlei)
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
