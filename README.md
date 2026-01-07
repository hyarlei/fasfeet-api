# 🚚 FastFeet - Sistema de Gerenciamento de Entregas

Sistema completo de gerenciamento de entregas desenvolvido com **NestJS** (Backend) e **React + TypeScript** (Frontend). O FastFeet permite o controle total de encomendas, destinatários e entregadores, com autenticação baseada em roles (Admin e Entregador).

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura do Sistema](#️-arquitetura-do-sistema)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Executando o Projeto](#executando-o-projeto)
- [Credenciais de Teste](#credenciais-de-teste)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O **FastFeet** é uma aplicação web desenvolvida para gerenciar o fluxo completo de entregas, desde o cadastro de encomendas até a confirmação de entrega com foto. O sistema possui dois perfis distintos:

- **Administrador**: Gerencia encomendas, destinatários e entregadores
- **Entregador**: Visualiza suas entregas, marca retiradas e confirma entregas com foto

## 🏗️ Arquitetura do Sistema

```mermaid
graph TB
    subgraph "Frontend - React + TypeScript"
        A[React App]
        B[Auth Context]
        C[Protected Routes]
        D[Pages/Components]
    end

    subgraph "Backend - NestJS"
        E[API Gateway]
        F[Auth Module]
        G[Users Module]
        H[Orders Module]
        I[Recipients Module]
        J[Prisma Service]
    end

    subgraph "Database"
        K[(PostgreSQL)]
    end

    subgraph "Storage"
        L[/Upload Files/]
    end

    A --> B
    B --> C
    C --> D
    D -->|HTTP/REST| E
    
    E --> F
    E --> G
    E --> H
    E --> I
    
    F -->|JWT Auth| J
    G --> J
    H --> J
    I --> J
    
    J --> K
    H --> L
    
    style A fill:#61dafb
    style E fill:#e0234e
    style K fill:#336791
    style L fill:#ffa500
```

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as Auth API
    participant DB as Database

    U->>F: Login (CPF + Senha)
    F->>A: POST /sessions
    A->>DB: Buscar usuário por CPF
    DB-->>A: Dados do usuário
    A->>A: Validar senha (bcrypt)
    A->>A: Gerar JWT Token
    A-->>F: Token + Dados do usuário
    F->>F: Armazenar no localStorage
    F-->>U: Redirecionar para Dashboard
    
    Note over F,A: Requisições subsequentes incluem Bearer Token
    
    F->>A: GET /orders (com Token)
    A->>A: Validar JWT
    A->>A: Verificar Role
    A->>DB: Buscar dados
    DB-->>A: Resultado
    A-->>F: Dados autorizados
```

### Diagrama de Entidades

```mermaid
erDiagram
    USER ||--o{ ORDER : delivers
    RECIPIENT ||--o{ ORDER : receives
    
    USER {
        string id PK
        string name
        string cpf UK
        string password
        enum role
    }
    
    RECIPIENT {
        string id PK
        string name
        string street
        int number
        string complement
        string city
        string state
        string zipcode
    }
    
    ORDER {
        string id PK
        enum status
        string tracking_code UK
        string photo_url
        datetime created_at
        datetime withdrawn_at
        datetime delivered_at
        string deliveryman_id FK
        string recipient_id FK
    }
```

## ✨ Funcionalidades

### 🔐 Autenticação

- Login com CPF e senha
- Autenticação JWT
- Controle de acesso baseado em roles (ADMIN/DELIVERYMAN)
- Proteção de rotas

### 📊 Dashboard (Admin)

- Visualização de estatísticas gerais
- Total de encomendas
- Encomendas pendentes
- Encomendas em trânsito
- Entregas realizadas hoje
- Gráficos de distribuição por status

### 📦 Gerenciamento de Encomendas (Admin)

- ➕ Criar nova encomenda
- 📋 Listar todas as encomendas
- ✏️ Editar encomenda
- 🗑️ Excluir encomenda
- 👁️ Visualizar detalhes
- 🔄 Alterar status manualmente
- 📍 Rastreamento com código único

### 👥 Gerenciamento de Destinatários (Admin)

- ➕ Cadastrar destinatário
- 📋 Listar destinatários
- ✏️ Editar dados do destinatário
- 🗑️ Remover destinatário
- 📍 Endereço completo com CEP

### 🚚 Gerenciamento de Entregadores (Admin)

- ➕ Cadastrar entregador
- 📋 Listar entregadores
- ✏️ Editar dados do entregador
- 🗑️ Remover entregador
- 📊 Visualizar estatísticas de entregas por entregador

### 📱 Área do Entregador

- 📦 Listar minhas entregas pendentes
- ✅ Marcar encomenda como retirada
- 📸 Confirmar entrega com upload de foto
- 🔍 Visualizar detalhes da entrega
- 📍 Informações do destinatário

## 🛠 Tecnologias

### Backend (fastfeet-api)

- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **class-validator** - Validação de DTOs
- **Multer** - Upload de arquivos

### Frontend (fastfeet-web)

- **React 18** - Biblioteca UI
- **TypeScript** - Linguagem
- **Vite** - Build tool
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (v14 ou superior)
- [Docker](https://www.docker.com/) (opcional, para rodar o PostgreSQL)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/hyarlei/fastfeet.git
cd FastFeet
```

### 2. Backend - API

```bash
cd fastfeet-api

# Instalar dependências
npm install

# Configurar banco de dados (com Docker)
docker-compose up -d

# Ou configure manualmente o PostgreSQL e ajuste o DATABASE_URL no .env

# Copiar arquivo de ambiente
cp .env.example .env

# Executar migrations do Prisma
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# (Opcional) Popular banco com dados de teste
npx prisma db seed
```

### 3. Frontend - Web

```bash
cd ../fastfeet-web

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env
```

## 🔐 Variáveis de Ambiente

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fastfeet?schema=public"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura"

# Server
PORT=3333
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3333
```

## ▶️ Executando o Projeto

### Backend

```bash
cd fastfeet-api

# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# A API estará rodando em http://localhost:3333
```

### Frontend

```bash
cd fastfeet-web

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# A aplicação estará rodando em http://localhost:5173
```

## 🔑 Credenciais de Teste

### Administrador

- **CPF**: `00000000000`
- **Senha**: `admin123`

### Entregador

- **CPF**: `11111111111`
- **Senha**: `entregador123`

## 📁 Estrutura do Projeto

```
FastFeet/
├── fastfeet-api/              # Backend - API NestJS
│   ├── prisma/
│   │   ├── migrations/        # Migrations do banco
│   │   ├── schema.prisma      # Schema do Prisma
│   │   └── prisma.config.ts   # Configuração Prisma 7
│   ├── src/
│   │   ├── auth/              # Módulo de autenticação
│   │   ├── orders/            # Módulo de encomendas
│   │   ├── recipients/        # Módulo de destinatários
│   │   ├── users/             # Módulo de usuários/entregadores
│   │   └── prisma/            # Módulo Prisma Service
│   ├── uploads/               # Arquivos de upload
│   └── docker-compose.yml     # Docker do PostgreSQL
│
├── fastfeet-web/              # Frontend - React
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   ├── Layout.tsx     # Layout com sidebar
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/          # Context API
│   │   │   └── AuthContext.tsx
│   │   ├── pages/             # Páginas da aplicação
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Recipients.tsx
│   │   │   ├── Deliverymen.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   └── axios.ts       # Configuração Axios
│   │   └── App.tsx            # Rotas principais
│   └── index.html
│
└── README.md
```

## 🔗 API Endpoints

### Autenticação

```http
POST /sessions
Body: { "cpf": "00000000000", "password": "admin123" }
```

### Usuários

```http
GET    /users              # Listar todos
GET    /users/:id          # Buscar por ID
POST   /users              # Criar usuário
PUT    /users/:id          # Atualizar
DELETE /users/:id          # Deletar
GET    /users/deliverymen  # Listar apenas entregadores
```

### Encomendas

```http
GET    /orders             # Listar todas
GET    /orders/:id         # Buscar por ID
POST   /orders             # Criar encomenda
PUT    /orders/:id         # Atualizar
DELETE /orders/:id         # Deletar
PATCH  /orders/:id/withdrawn   # Marcar como retirada
PATCH  /orders/:id/delivered   # Marcar como entregue (com foto)
```

### Destinatários

```http
GET    /recipients         # Listar todos
GET    /recipients/:id     # Buscar por ID
POST   /recipients         # Criar destinatário
PUT    /recipients/:id     # Atualizar
DELETE /recipients/:id     # Deletar
```

## 📸 Screenshots

### Dashboard Admin

![Dashboard](fastfeet-web/public/dashboard.png)

### Gerenciamento de Encomendas

![Encomendas](fastfeet-web/public/orders.png)

### Área do Entregador

![Entregador](fastfeet-web/public/deliveryman.png)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido por **Hyarlei Silva**

- GitHub: [@hyarlei](https://github.com/hyarlei)
- LinkedIn: [Hyarlei Silva](https://www.linkedin.com/in/hyarlei)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!
