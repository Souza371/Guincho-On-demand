# Guincho On-Demand - Sistema Completo

## 📋 Sobre o Projeto

Sistema completo de solicitação de guincho e serviços automotivos com:

- **Backend**: API REST em Node.js + TypeScript + Prisma + PostgreSQL
- **Mobile**: Aplicativo React Native para usuários e prestadores
- **Web Admin**: Painel administrativo em React.js + TypeScript
- **Banco de Dados**: PostgreSQL com Prisma ORM

## 🚀 Como Executar o Sistema

### Pré-requisitos

- Node.js 18+ 
- Docker Desktop
- Git

### 1. Backend (API)

```bash
cd backend
npm install
docker-compose up -d  # Inicia PostgreSQL
npx prisma generate
npx prisma db push
npm run dev
```

A API estará disponível em: http://localhost:3001

### 2. Aplicativo Mobile

```bash
cd mobile
npm install

# Para Android
npx react-native run-android

# Para iOS
npx react-native run-ios
```

### 3. Painel Web Admin

```bash
cd web-admin
npm install
npm start
```

O painel estará disponível em: http://localhost:3000

**Login do Admin:**
- Email: `admin@guincho.com`
- Senha: `123456`

### 4. Executar Tudo de Uma Vez (Windows)

```powershell
# No diretório raiz
.\start.ps1
```

## 📱 Funcionalidades Implementadas

### Backend API
- ✅ Autenticação JWT com refresh token
- ✅ CRUD completo de usuários
- ✅ CRUD completo de prestadores
- ✅ Sistema de corridas/viagens
- ✅ Sistema de propostas
- ✅ Sistema de avaliações
- ✅ WebSocket para atualizações em tempo real
- ✅ Upload de arquivos
- ✅ Middleware de autenticação
- ✅ Tratamento de erros
- ✅ Validação de dados

### Mobile App
- ✅ Navegação por Stack e Bottom Tabs
- ✅ Contexto de autenticação
- ✅ Contexto de localização
- ✅ Serviços de API
- ✅ Telas para usuários e prestadores
- ✅ Integração com mapas
- ✅ Interface responsiva

### Painel Web Admin
- ✅ Login e autenticação
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de usuários
- ✅ Gerenciamento de prestadores
- ✅ Monitoramento de viagens
- ✅ Relatórios e analytics
- ✅ Interface responsiva e moderna

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- `User` - Usuários do sistema
- `Provider` - Prestadores de serviço
- `Ride` - Solicitações de viagem
- `Proposal` - Propostas de prestadores
- `Rating` - Avaliações de serviços

## 🔐 Autenticação

### JWT Tokens
- Access Token: 15 minutos
- Refresh Token: 7 dias
- Middleware de proteção de rotas
- Renovação automática de tokens

## 🌐 Endpoints da API

### Autenticação
- `POST /auth/login` - Login de usuários
- `POST /auth/refresh` - Renovar tokens
- `POST /auth/logout` - Logout

### Usuários
- `GET /users` - Listar usuários
- `POST /users` - Criar usuário
- `GET /users/:id` - Buscar usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

### Prestadores
- `GET /providers` - Listar prestadores
- `POST /providers` - Criar prestador
- `GET /providers/:id` - Buscar prestador
- `PUT /providers/:id` - Atualizar prestador
- `DELETE /providers/:id` - Deletar prestador

### Viagens
- `GET /rides` - Listar viagens
- `POST /rides` - Criar viagem
- `GET /rides/:id` - Buscar viagem
- `PUT /rides/:id` - Atualizar viagem
- `POST /rides/:id/proposals` - Criar proposta
- `PUT /rides/:id/accept/:proposalId` - Aceitar proposta
- `POST /rides/:id/complete` - Finalizar viagem
- `POST /rides/:id/rate` - Avaliar serviço

### Admin
- `GET /admin/stats` - Estatísticas gerais
- `GET /admin/users` - Gerenciar usuários
- `GET /admin/providers` - Gerenciar prestadores
- `GET /admin/rides` - Monitorar viagens

## 🎨 Tecnologias Utilizadas

### Backend
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT
- Socket.io
- Multer (upload de arquivos)
- Joi (validação)

### Mobile
- React Native 0.81.4
- TypeScript
- React Navigation 6
- AsyncStorage
- React Native Maps
- Axios

### Web Admin
- React 19.1.1
- TypeScript
- CSS3 com Grid/Flexbox
- Context API
- Local Storage

### DevOps
- Docker
- Docker Compose
- Scripts PowerShell

## 🔧 Configuração

### Variáveis de Ambiente (Backend)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/guincho_db"
JWT_SECRET="seu-jwt-secret-aqui"
JWT_REFRESH_SECRET="seu-refresh-secret-aqui"
PORT=3001
```

### Docker Compose

O projeto inclui configuração Docker para PostgreSQL:

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: guincho_db
    ports:
      - "5432:5432"
```

## 🚧 Próximos Passos

### Backend
- [ ] Sistema de notificações push
- [ ] Integração com gateway de pagamento
- [ ] Sistema de chat em tempo real
- [ ] API de geolocalização avançada
- [ ] Logs estruturados

### Mobile
- [ ] Push notifications
- [ ] Pagamento integrado
- [ ] Chat em tempo real
- [ ] Câmera para fotos
- [ ] Offline support

### Web Admin
- [ ] Gráficos interativos
- [ ] Exportação de relatórios
- [ ] Sistema de notificações
- [ ] Configurações do sistema
- [ ] Logs de auditoria

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique se todas as dependências estão instaladas
2. Certifique-se que o Docker está rodando
3. Confirme que as portas estão livres (3000, 3001, 5432)
4. Verifique os logs do console para erros específicos

## 📄 Licença

Este projeto é para fins educacionais e de demonstração.