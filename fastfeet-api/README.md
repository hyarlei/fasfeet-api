# 🚀 FastFeet API

API REST desenvolvida com **NestJS** e **Prisma ORM** para gerenciamento de entregas. Sistema completo com autenticação JWT, controle de acesso baseado em roles e upload de arquivos.

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Database](#-database)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Módulos](#-módulos)
- [API Endpoints](#-api-endpoints)
- [Autenticação](#-autenticação)
- [Testes](#-testes)

## 🛠 Tecnologias

- **NestJS** - Framework Node.js progressivo
- **TypeScript** - Superset JavaScript com tipagem
- **Prisma ORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **Passport JWT** - Autenticação JWT
- **bcryptjs** - Hash de senhas
- **class-validator** - Validação de DTOs
- **class-transformer** - Transformação de objetos
- **Multer** - Upload de arquivos

## 📦 Pré-requisitos

- Node.js >= 18
- npm ou yarn
- PostgreSQL >= 14
- Docker (opcional)

## 🚀 Instalação

### 1. Clone e instale as dependências

```bash
npm install
```

### 2. Configure o banco de dados

Com Docker:

```bash
docker-compose up -d
```

Sem Docker, configure o PostgreSQL manualmente e ajuste a `DATABASE_URL` no arquivo `.env`.

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais.

### 4. Execute as migrations

```bash
npx prisma migrate dev
```

### 5. Gere o Prisma Client

```bash
npx prisma generate
```

### 6. (Opcional) Popular o banco com dados de teste

```bash
npx prisma db seed
```

## 🔐 Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fastfeet?schema=public"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura-aqui"

# Server
PORT=3333
```

## 💾 Database

### Schema Prisma

O projeto utiliza Prisma 7 com configuração separada. O schema está em `prisma/schema.prisma`:

```prisma
enum UserRole {
  ADMIN
  DELIVERYMAN
}

model User {
  id        String   @id @default(uuid())
  name      String
  cpf       String   @unique
  password  String
  role      UserRole @default(DELIVERYMAN)
  deliveries Order[]
}

model Recipient {
  id         String @id @default(uuid())
  name       String
  street     String
  number     Int
  complement String?
  city       String
  state      String
  zipcode    String
  orders Order[]
}

enum OrderStatus {
  WAITING
  WITHDRAWN
  DELIVERED
  RETURNED
}

model Order {
  id            String      @id @default(uuid())
  status        OrderStatus @default(WAITING)
  tracking_code String      @unique
  photo_url     String?
  created_at    DateTime    @default(now())
  updated_at    DateTime?   @updatedAt
  withdrawn_at  DateTime?
  delivered_at  DateTime?
  deliveryman_id String?
  deliveryman    User?   @relation(fields: [deliveryman_id], references: [id])
  recipient_id   String
  recipient      Recipient @relation(fields: [recipient_id], references: [id])
}
```

### Comandos Úteis do Prisma

```bash
# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Resetar banco de dados
npx prisma migrate reset

# Ver status das migrations
npx prisma migrate status

# Abrir Prisma Studio (GUI do banco)
npx prisma studio

# Gerar Prisma Client
npx prisma generate
```

## 📁 Estrutura do Projeto

```
src/
├── auth/                      # Módulo de autenticação
│   ├── auth.controller.ts     # Endpoint de login
│   ├── auth.service.ts        # Lógica de autenticação
│   ├── jwt.strategy.ts        # Estratégia JWT do Passport
│   ├── roles.decorator.ts     # Decorator para roles
│   ├── roles.guard.ts         # Guard de autorização
│   └── dto/
│       └── login.dto.ts       # DTO de login
│
├── users/                     # Módulo de usuários
│   ├── users.controller.ts    # Endpoints CRUD
│   ├── users.service.ts       # Lógica de negócio
│   ├── deliverymen.controller.ts  # Endpoints específicos para entregadores
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── entities/
│       └── user.entity.ts
│
├── orders/                    # Módulo de encomendas
│   ├── orders.controller.ts   # Endpoints CRUD
│   ├── orders.service.ts      # Lógica de negócio
│   ├── dto/
│   │   ├── create-order.dto.ts
│   │   └── update-order.dto.ts
│   └── entities/
│       └── order.entity.ts
│
├── recipients/                # Módulo de destinatários
│   ├── recipients.controller.ts
│   ├── recipients.service.ts
│   ├── dto/
│   │   ├── create-recipient.dto.ts
│   │   └── update-recipient.dto.ts
│   └── entities/
│       └── recipient.entity.ts
│
├── prisma/                    # Módulo Prisma Service
│   ├── prisma.service.ts      # Serviço global do Prisma
│   └── prisma.module.ts
│
├── app.module.ts              # Módulo raiz
└── main.ts                    # Bootstrap da aplicação
```

## 🧩 Módulos

### Auth Module

- **POST /sessions** - Login e geração de token JWT
- Validação de CPF e senha
- Geração de tokens com expiração de 7 dias

### Users Module

- CRUD completo de usuários
- Criação de admin e entregadores
- Hash de senhas com bcrypt
- Listagem específica de entregadores

### Orders Module

- CRUD completo de encomendas
- Geração automática de código de rastreamento
- Upload de foto de entrega
- Alteração de status (WAITING → WITHDRAWN → DELIVERED)
- Controle de timestamps por status

### Recipients Module

- CRUD completo de destinatários
- Validação de endereço completo

## 📡 API Endpoints

### Autenticação

#### Login

```http
POST /sessions
Content-Type: application/json

{
  "cpf": "00000000000",
  "password": "admin123"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Admin",
    "cpf": "00000000000",
    "role": "ADMIN"
  }
}
```

### Usuários

#### Listar todos os usuários

```http
GET /users
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Admin",
    "cpf": "00000000000",
    "role": "ADMIN"
  }
]
```

#### Criar usuário

```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "cpf": "12345678900",
  "password": "senha123",
  "role": "DELIVERYMAN"
}
```

#### Atualizar usuário

```http
PUT /users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva Atualizado"
}
```

#### Deletar usuário

```http
DELETE /users/:id
Authorization: Bearer {token}
```

#### Listar apenas entregadores

```http
GET /users/deliverymen
Authorization: Bearer {token}
```

### Encomendas

#### Listar todas as encomendas

```http
GET /orders
Authorization: Bearer {token}
```

#### Buscar encomenda por ID

```http
GET /orders/:id
Authorization: Bearer {token}
```

#### Criar encomenda

```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipient_id": "uuid-do-destinatario",
  "deliveryman_id": "uuid-do-entregador"
}
```

#### Atualizar encomenda

```http
PUT /orders/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "WITHDRAWN"
}
```

#### Marcar como retirada

```http
PATCH /orders/:id/withdrawn
Authorization: Bearer {token}
```

#### Marcar como entregue (com foto)

```http
PATCH /orders/:id/delivered
Authorization: Bearer {token}
Content-Type: multipart/form-data

photo: [arquivo]
```

#### Deletar encomenda

```http
DELETE /orders/:id
Authorization: Bearer {token}
```

### Destinatários

#### Listar todos

```http
GET /recipients
Authorization: Bearer {token}
```

#### Buscar por ID

```http
GET /recipients/:id
Authorization: Bearer {token}
```

#### Criar destinatário

```http
POST /recipients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Maria Santos",
  "street": "Rua das Flores",
  "number": 123,
  "complement": "Apto 45",
  "city": "São Paulo",
  "state": "SP",
  "zipcode": "01234567"
}
```

#### Atualizar destinatário

```http
PUT /recipients/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Maria Santos Silva"
}
```

#### Deletar destinatário

```http
DELETE /recipients/:id
Authorization: Bearer {token}
```

## 🔒 Autenticação

### JWT Strategy

A API utiliza autenticação JWT com Passport. O token deve ser incluído no header:

```
Authorization: Bearer {token}
```

### Guards

#### JwtAuthGuard

Protege rotas que requerem autenticação.

#### RolesGuard

Protege rotas baseado em roles (ADMIN/DELIVERYMAN).

#### Uso nos Controllers

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Get()
findAll() {
  // Apenas admins podem acessar
}
```

## 🧪 Testes

### Executar testes

```bash
# unit tests
npm test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 🚀 Executando o Projeto

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3333`

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvido por

**Hyarlei Silva** - [GitHub](https://github.com/hyarlei)

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
