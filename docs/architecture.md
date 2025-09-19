# Arquitetura do Sistema Guincho On-demand

## 📐 Visão Geral da Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web Admin     │    │   Integrations  │
│  (React Native) │    │   (React.js)    │    │  (Maps, Push,   │
│                 │    │                 │    │   Payments)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │      Backend API        │
                    │   (Node.js + Express)   │
                    │                         │
                    └─────────────┬───────────┘
                                  │
                         ┌────────┴────────┐
                         │   PostgreSQL    │
                         │    Database     │
                         └─────────────────┘
```

## 🗃️ Modelo de Dados

### Entidades Principais

#### User (Cliente)
- id: UUID (PK)
- name: string
- email: string (unique)
- phone: string (unique)
- password: string (hash)
- avatar?: string
- payment_methods: PaymentMethod[]
- addresses: Address[]
- subscription_plan?: SubscriptionPlan
- created_at: datetime
- updated_at: datetime

#### Provider (Guincheiro)
- id: UUID (PK)
- name: string
- email: string (unique)
- phone: string (unique)
- password: string (hash)
- avatar?: string
- cnh: string
- vehicle_documents: VehicleDocument[]
- service_areas: ServiceArea[]
- rating: decimal
- total_rides: integer
- status: enum (active, inactive, pending_approval)
- created_at: datetime
- updated_at: datetime

#### Ride (Corrida/Solicitação)
- id: UUID (PK)
- user_id: UUID (FK)
- provider_id?: UUID (FK)
- service_type: enum (light_tow, heavy_tow, tire_change, fuel, battery)
- origin_location: Point (PostGIS)
- destination_location?: Point (PostGIS)
- origin_address: string
- destination_address?: string
- status: enum (pending, accepted, in_progress, completed, cancelled)
- estimated_price?: decimal
- final_price?: decimal
- estimated_time?: integer (minutes)
- description?: text
- payment_method: string
- payment_status: enum (pending, paid, refunded)
- created_at: datetime
- updated_at: datetime
- completed_at?: datetime

#### RideProposal (Proposta)
- id: UUID (PK)
- ride_id: UUID (FK)
- provider_id: UUID (FK)
- price: decimal
- estimated_time: integer (minutes)
- message?: text
- status: enum (pending, accepted, rejected, expired)
- created_at: datetime
- expires_at: datetime

#### Rating (Avaliação)
- id: UUID (PK)
- ride_id: UUID (FK)
- evaluator_id: UUID (FK) // user or provider
- evaluated_id: UUID (FK) // user or provider
- rating: integer (1-5)
- comment?: text
- created_at: datetime

#### Payment
- id: UUID (PK)
- ride_id: UUID (FK)
- amount: decimal
- method: enum (pix, credit_card, debit_card, cash)
- status: enum (pending, completed, failed, refunded)
- external_payment_id?: string
- commission_amount: decimal
- provider_amount: decimal
- created_at: datetime
- processed_at?: datetime

#### SubscriptionPlan
- id: UUID (PK)
- name: string
- price: decimal
- rides_included: integer
- description: text
- active: boolean

#### Admin
- id: UUID (PK)
- name: string
- email: string (unique)
- password: string (hash)
- role: enum (super_admin, admin, moderator)
- permissions: Permission[]
- created_at: datetime

## 🔄 Fluxo Principal

### 1. Solicitação de Serviço
```
Cliente abre app → Seleciona localização → Escolhe tipo de serviço → 
Descreve problema → Confirma solicitação → Sistema notifica guincheiros próximos
```

### 2. Processo de Aceitação
```
Guincheiros recebem notificação → Visualizam detalhes → Enviam proposta com preço → 
Cliente visualiza propostas → Escolhe melhor opção → Guincheiro é notificado
```

### 3. Execução do Serviço
```
Guincheiro se dirige ao local → Rastreamento em tempo real → 
Chegada confirmada → Execução do serviço → Conclusão confirmada
```

### 4. Pagamento e Avaliação
```
Pagamento processado automaticamente → Ambos avaliam o serviço → 
Histórico atualizado → Comissão calculada
```

## 🔒 Segurança

### Autenticação
- JWT tokens para sessões
- Refresh tokens para renovação
- Rate limiting nas APIs
- Validação de documentos por IA/manual

### Autorização
- RBAC (Role-Based Access Control)
- Middleware de verificação de permissões
- Separação de contextos (cliente/provider/admin)

### Dados Sensíveis
- Criptografia de senhas (bcrypt)
- PCI compliance para pagamentos
- LGPD compliance para dados pessoais
- Logs de auditoria

## 📡 APIs e Integrações

### APIs Internas
- Authentication API
- User Management API
- Provider Management API
- Ride Management API
- Payment API
- Rating API
- Admin API

### APIs Externas
- **Google Maps API**: Geocoding, routing, real-time tracking
- **Firebase Cloud Messaging**: Push notifications
- **Stripe/Mercado Pago**: Processamento de pagamentos
- **AWS S3**: Upload de documentos e imagens
- **Twilio/AWS SNS**: SMS notifications

## 🚀 Deploy e Infraestrutura

### Desenvolvimento
- Docker Compose para ambiente local
- PostgreSQL + Redis containers
- Hot reload para desenvolvimento

### Produção
- AWS ECS ou Kubernetes
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis para sessões
- CloudFront CDN
- Application Load Balancer
- Auto Scaling Groups

### Monitoramento
- AWS CloudWatch ou Datadog
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Database monitoring
- Real-time alerts