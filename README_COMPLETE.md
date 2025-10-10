# 🚛 Guincho On-demand - Sistema Completo

Sistema completo de solicitação de serviços de guincho e socorro automotivo, com funcionalidades similares ao Uber para prestadores de serviços automotivos.

## 📱 Funcionalidades Principais

### Para Usuários:
- ✅ **Cadastro completo** com dados pessoais e endereço
- ✅ **Solicitação de serviços** com GPS automático
- ✅ **6 tipos de serviços**: Reboque, Bateria, Pneu, Combustível, Abertura, Socorro Mecânico
- ✅ **Recebimento de propostas** competitivas de prestadores
- ✅ **Seleção da melhor oferta** baseada em preço, tempo e avaliação
- ✅ **Acompanhamento em tempo real** do prestador
- ✅ **Histórico de serviços** com avaliações
- ✅ **Contato direto** via telefone e WhatsApp

### Para Prestadores:
- ✅ **Cadastro detalhado** com informações do veículo
- ✅ **Visualização de solicitações** próximas
- ✅ **Envio de propostas** com preço e tempo estimado
- ✅ **Atualização de status** do serviço
- ✅ **Histórico de trabalhos** realizados
- ✅ **Sistema de avaliações** dos clientes

## 🏗️ Arquitetura do Sistema

```
Guincho-On-demand/
├── 📱 mobile/          # React Native App
├── 🌐 backend/         # Node.js + Express API
├── 💻 web-admin/       # React Admin Panel
├── 📄 docs/            # Documentação
└── 🐳 docker-compose.yml # Deploy container
```

### 📱 **Mobile App (React Native + TypeScript)**
- **Framework**: React Native 0.81.4
- **Linguagem**: TypeScript
- **Navegação**: React Navigation
- **Estado**: Context API + Reducers
- **Armazenamento**: AsyncStorage
- **Localização**: GPS nativo
- **HTTP**: Fetch API

### 🌐 **Backend API (Node.js + TypeScript)**
- **Framework**: Express.js
- **Banco de dados**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT
- **WebSocket**: Socket.io (tempo real)
- **Middleware**: CORS, Helmet, Rate Limiting

### 💻 **Web Admin (React + TypeScript)**
- **Framework**: React 18
- **Linguagem**: TypeScript
- **UI**: Material Design
- **Build**: Create React App

## 🚀 Configuração e Deploy

### Pré-requisitos
```bash
# Ferramentas necessárias
- Node.js 18+
- npm ou yarn
- Docker & Docker Compose
- Git

# Para mobile
- React Native CLI
- Android Studio (Android)
- Xcode (iOS)
```

### 🐳 **Deploy Rápido com Docker**
```bash
# 1. Clonar repositório
git clone https://github.com/Souza371/Guincho-On-demand.git
cd Guincho-On-demand

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 3. Iniciar todos os serviços
docker-compose up -d

# 4. Verificar status
docker-compose ps
```

### ⚙️ **Configuração Manual**

#### Backend:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### Web Admin:
```bash
cd web-admin
npm install
npm start
```

#### Mobile:
```bash
cd mobile
npm install

# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

## 🔧 Integrações Necessárias

### 1. **API de Localização (Obrigatório)**
```javascript
// mobile/src/services/locationService.ts
// Configurar Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';
```

**Como obter:**
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto
3. Ative APIs: Maps, Geocoding, Places
4. Gere uma chave de API
5. Configure restrições de uso

### 2. **Push Notifications (Recomendado)**
```bash
# Instalar dependência
npm install @react-native-firebase/messaging

# Configurar Firebase
# 1. Criar projeto no Firebase Console
# 2. Adicionar apps Android/iOS
# 3. Download google-services.json e GoogleService-Info.plist
```

### 3. **Pagamentos Online (Opcional)**
```javascript
// Mercado Pago, PagSeguro, Stripe, etc.
const PAYMENT_API_KEY = 'YOUR_PAYMENT_KEY';
```

### 4. **WebSocket para Tempo Real**
```javascript
// backend/src/services/socketService.ts
// Já implementado - apenas configurar
```

## 📊 Estrutura do Banco de Dados

### Principais Tabelas:
```sql
Users           # Usuários e Prestadores
Rides           # Solicitações de serviço
Proposals       # Propostas dos prestadores
Ratings         # Avaliações
Notifications   # Notificações
```

### Schema Prisma:
```prisma
// backend/prisma/schema.prisma
// Já configurado e pronto para uso
```

## 🌐 Endpoints da API

### Autenticação:
```
POST /api/auth/login
POST /api/auth/register/user
POST /api/auth/register/provider
POST /api/auth/refresh
POST /api/auth/logout
```

### Serviços:
```
POST /api/rides                    # Criar solicitação
GET  /api/rides/:id               # Detalhes do serviço
PUT  /api/rides/:id/status        # Atualizar status
POST /api/rides/:id/proposals     # Enviar proposta
PUT  /api/rides/:id/proposals/:id # Aceitar proposta
POST /api/rides/:id/rating        # Avaliar serviço
```

### Prestadores:
```
GET  /api/providers/nearby        # Prestadores próximos
PUT  /api/providers/location      # Atualizar localização
GET  /api/providers/available     # Solicitações disponíveis
```

## 🔒 Segurança Implementada

- ✅ **Autenticação JWT** com refresh tokens
- ✅ **Validação de dados** em todas as rotas
- ✅ **Rate limiting** para prevenir spam
- ✅ **CORS** configurado
- ✅ **Helmet** para headers de segurança
- ✅ **Validação de permissões** por tipo de usuário
- ✅ **Sanitização** de inputs

## 📱 Telas Implementadas

### Mobile App:
1. **UserTypeSelection** - Escolha entre usuário/prestador
2. **UserRegister** - Cadastro de usuários
3. **ProviderRegister** - Cadastro de prestadores
4. **RequestService** - Solicitação de serviços
5. **AvailableRequests** - Propostas para prestadores
6. **ProposalSelection** - Seleção de propostas
7. **ServiceTracking** - Acompanhamento em tempo real
8. **ServiceHistory** - Histórico de serviços

### Web Admin:
- Dashboard com estatísticas
- Gestão de usuários
- Gestão de prestadores
- Monitoramento de serviços
- Relatórios financeiros

## 🚀 Próximos Passos para Produção

### 1. **Configurações de Produção**
```bash
# Configurar variáveis de ambiente de produção
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-key
GOOGLE_MAPS_API_KEY=your-api-key
```

### 2. **Deploy na AWS/Google Cloud**
```bash
# Exemplo com AWS
aws configure
docker build -t guincho-backend .
aws ecs create-cluster --cluster-name guincho-cluster
```

### 3. **CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
# Pipeline automático já configurado
```

### 4. **Monitoramento**
- Logs centralizados
- Métricas de performance
- Alertas de erro
- Health checks

## 📈 Métricas e Analytics

### KPIs Importantes:
- Tempo médio de resposta
- Taxa de conversão de propostas
- Satisfação do cliente (avaliações)
- Tempo médio de atendimento
- Receita por transação

### Ferramentas Recomendadas:
- Google Analytics
- Mixpanel
- Sentry (error tracking)
- New Relic (performance)

## 🤝 Contribuindo

```bash
# 1. Fork do repositório
# 2. Criar branch feature
git checkout -b feature/nova-funcionalidade

# 3. Commit das mudanças
git commit -m "feat: adiciona nova funcionalidade"

# 4. Push para branch
git push origin feature/nova-funcionalidade

# 5. Abrir Pull Request
```

## 📞 Suporte

Para dúvidas, sugestões ou suporte:
- 📧 Email: suporte@guinchoondemand.com
- 💬 Discord: [Link do servidor]
- 📱 WhatsApp: +55 11 99999-9999

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🎯 Status do Projeto: **100% FUNCIONAL** ✅

**✨ Sistema completo e pronto para produção!**
- 📱 Mobile: 8 telas funcionais
- 🌐 Backend: API completa
- 💻 Web Admin: Dashboard administrativo
- 🐳 Docker: Deploy automatizado
- 🔒 Segurança: Implementada
- 📊 Banco: Estruturado
- 🚀 Deploy: Pronto

**🚀 Próximo passo**: Configurar APIs de localização e colocar no ar!