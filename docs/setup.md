# Configuração de Desenvolvimento

Este documento descreve como configurar o ambiente de desenvolvimento para o sistema Guincho On-demand.

## 📋 Pré-requisitos

### Software Necessário
- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (v14 ou superior)
- **Redis** (v6 ou superior)
- **Docker** e **Docker Compose** (para desenvolvimento)
- **React Native CLI** (para mobile)
- **Android Studio** (para Android)
- **Xcode** (para iOS, apenas macOS)

### Contas de Serviços Externos
- **Google Cloud Platform** (para Google Maps API)
- **Firebase** (para push notifications)
- **Stripe** ou **Mercado Pago** (para pagamentos)
- **AWS** ou **Azure** (para storage)

## ⚙️ Configuração do Ambiente

### 1. Clone o Repositório
```bash
git clone https://github.com/Souza371/Guincho-On-demand.git
cd Guincho-On-demand
```

### 2. Configure o Backend
```bash
cd backend
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

### 3. Configure o Mobile App
```bash
cd mobile
npm install
# Para Android
npx react-native run-android
# Para iOS (apenas macOS)
npx react-native run-ios
```

### 4. Configure o Web Admin
```bash
cd web-admin
npm install
npm start
```

## 🐳 Usando Docker (Recomendado)

### 1. Inicie os Serviços
```bash
docker-compose up -d
```

### 2. Execute as Migrações
```bash
docker-compose exec backend npm run db:migrate
```

### 3. Popule com Dados de Teste
```bash
docker-compose exec backend npm run db:seed
```

## 🔑 Variáveis de Ambiente

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/guincho_db"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# External APIs
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
FIREBASE_SERVER_KEY="your-firebase-server-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
MERCADO_PAGO_ACCESS_TOKEN="your-mercado-pago-token"

# AWS (for file uploads)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_BUCKET_NAME="your-s3-bucket"
AWS_REGION="us-east-1"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-email-password"

# Application
PORT=3000
NODE_ENV="development"
API_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3001"
```

### Mobile (.env)
```env
API_BASE_URL="http://localhost:3000/api"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
ENVIRONMENT="development"
```

### Web Admin (.env)
```env
REACT_APP_API_URL="http://localhost:3000/api"
REACT_APP_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

## 📱 Configuração Mobile Específica

### Android
1. Configure o Android SDK
2. Crie um emulador Android
3. Configure as permissões no `android/app/src/main/AndroidManifest.xml`

### iOS (macOS apenas)
1. Instale o Xcode
2. Configure os simuladores iOS
3. Configure as permissões no `ios/GuinchoApp/Info.plist`

## 🧪 Executando Testes

### Backend
```bash
cd backend
npm run test
npm run test:coverage
```

### Mobile
```bash
cd mobile
npm run test
```

### Web Admin
```bash
cd web-admin
npm run test
```

## 📊 Dados de Teste

O sistema inclui dados de teste que podem ser carregados usando:

```bash
npm run db:seed
```

### Usuários de Teste
- **Admin**: admin@guincho.com / admin123
- **Cliente**: cliente@test.com / cliente123
- **Guincheiro**: guincheiro@test.com / guincheiro123

## 🔧 Ferramentas de Desenvolvimento

### Recomendadas
- **VS Code** com extensões:
  - TypeScript
  - Prettier
  - ESLint
  - React Native Tools
- **Postman** ou **Insomnia** (para testar APIs)
- **React Native Debugger**
- **Database Client** (DBeaver, pgAdmin)

### Scripts Úteis
```bash
# Backend
npm run dev           # Inicia em modo desenvolvimento
npm run build         # Build para produção
npm run db:migrate    # Executa migrações
npm run db:seed       # Popula dados de teste
npm run db:reset      # Reseta o banco

# Mobile
npm run android       # Executa no Android
npm run ios          # Executa no iOS
npm run start        # Inicia o Metro bundler

# Web Admin
npm start            # Inicia em modo desenvolvimento
npm run build        # Build para produção
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique se PostgreSQL está rodando
   - Confirme as credenciais no `.env`

2. **React Native não compila**
   - Limpe o cache: `npx react-native start --reset-cache`
   - Rebuild: `cd android && ./gradlew clean`

3. **APIs externas não funcionam**
   - Verifique se as chaves estão corretas
   - Confirme os limites de uso das APIs

4. **Problemas com Docker**
   - Rebuild containers: `docker-compose build --no-cache`
   - Verifique logs: `docker-compose logs -f`

### Logs e Debug
- **Backend**: Logs no console e arquivo `logs/app.log`
- **Mobile**: React Native Debugger ou Chrome DevTools
- **Web**: Chrome DevTools

## 📞 Suporte

Se encontrar problemas, verifique:
1. Este documento primeiro
2. Issues no GitHub
3. Documentação das dependências
4. Stack Overflow para problemas específicos