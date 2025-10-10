# 🔧 Guia de Integração - APIs e Produção

## 📍 1. Integração com Google Maps API

### Passo 1: Obter Chave da API
```bash
# 1. Acesse: https://console.cloud.google.com
# 2. Crie um projeto ou selecione um existente
# 3. Vá em "APIs e Serviços" > "Biblioteca"
# 4. Ative as seguintes APIs:
#    - Maps JavaScript API
#    - Geocoding API
#    - Places API
#    - Geolocation API
# 5. Vá em "Credenciais" > "Criar credenciais" > "Chave de API"
```

### Passo 2: Configurar no Mobile
```javascript
// mobile/src/services/locationService.ts
// Substituir linha 271:
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// Por:
const GOOGLE_MAPS_API_KEY = 'AIzaSyC1234567890abcdefghijklmnop';
```

### Passo 3: Configurar no Backend
```javascript
// backend/.env
GOOGLE_MAPS_API_KEY=AIzaSyC1234567890abcdefghijklmnop
```

### Passo 4: Instalar Dependências de Localização
```bash
cd mobile

# Para React Native
npm install react-native-geolocation-service
npm install react-native-permissions
npm install @react-native-community/geolocation

# Para Android - adicionar em android/app/src/main/AndroidManifest.xml:
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

# Para iOS - adicionar em ios/GuinchoApp/Info.plist:
<key>NSLocationWhenInUseUsageDescription</key>
<string>Este app precisa de localização para encontrar prestadores próximos</string>
```

## 🔄 2. Integração Backend Completa

### Passo 1: Configurar Banco de Dados
```bash
cd backend

# 1. Configurar PostgreSQL
# Opção A: Docker
docker run --name guincho-postgres -e POSTGRES_PASSWORD=senha123 -d -p 5432:5432 postgres

# Opção B: Local (instalar PostgreSQL)
createdb guincho_db

# 2. Configurar .env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/guincho_db"
JWT_SECRET="seu-jwt-secret-super-secreto"
PORT=3000
```

### Passo 2: Executar Migrações
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed # Popular banco com dados iniciais
```

### Passo 3: Iniciar Backend
```bash
npm run dev
# Backend rodando em http://localhost:3000
```

### Passo 4: Testar Endpoints
```bash
# Teste de conectividade
curl http://localhost:3000/api/auth/test

# Registro de usuário
curl -X POST http://localhost:3000/api/auth/register/user \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@email.com","password":"123456","phone":"11999999999"}'
```

## 📱 3. Configurar Mobile para Produção

### Passo 1: Configurar API Base URL
```javascript
// mobile/src/services/apiService.ts
// Substituir linha 5:
const API_BASE_URL = __DEV__ ? 'http://10.0.2.2:3000' : 'https://your-production-api.com';

// Por:
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000'  // Desenvolvimento 
  : 'https://api.guinchoondemand.com'; // Produção
```

### Passo 2: Configurar Permissões Android
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CALL_PHONE" />
```

### Passo 3: Configurar Permissões iOS
```xml
<!-- ios/GuinchoApp/Info.plist -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Para encontrar prestadores próximos à sua localização</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Para rastreamento durante o atendimento</string>
<key>NSCameraUsageDescription</key>
<string>Para enviar fotos do problema</string>
```

## 🔔 4. Configurar Notificações Push (Firebase)

### Passo 1: Criar Projeto Firebase
```bash
# 1. Acesse: https://console.firebase.google.com
# 2. Clique em "Criar um projeto"
# 3. Nome: "Guincho On-demand"
# 4. Ativar Google Analytics (opcional)
```

### Passo 2: Adicionar Apps
```bash
# Android:
# 1. Clique no ícone do Android
# 2. Package name: com.guinchoapp
# 3. Baixar google-services.json
# 4. Colocar em: mobile/android/app/

# iOS:
# 1. Clique no ícone do iOS  
# 2. Bundle ID: org.reactjs.native.example.GuinchoApp
# 3. Baixar GoogleService-Info.plist
# 4. Colocar em: mobile/ios/GuinchoApp/
```

### Passo 3: Instalar Dependências
```bash
cd mobile
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging

# Rebuild do projeto
npx react-native run-android
npx react-native run-ios
```

### Passo 4: Configurar Servidor
```javascript
// backend/src/services/notificationService.ts
const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-admin-sdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const sendNotification = async (token, title, body) => {
  const message = {
    notification: { title, body },
    token: token,
  };
  
  return admin.messaging().send(message);
};
```

## 💳 5. Integração de Pagamentos (Mercado Pago)

### Passo 1: Criar Conta Mercado Pago
```bash
# 1. Acesse: https://www.mercadopago.com.br/developers
# 2. Crie uma aplicação
# 3. Obtenha as chaves:
#    - Public Key (frontend)
#    - Access Token (backend)
```

### Passo 2: Configurar Backend
```bash
cd backend
npm install mercadopago

# Adicionar no .env:
MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-abcdef
```

```javascript
// backend/src/services/paymentService.ts
import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export const createPayment = async (amount: number, description: string) => {
  const payment_data = {
    transaction_amount: amount,
    description: description,
    payment_method_id: 'pix',
    payer: {
      email: 'user@example.com',
    },
  };

  return mercadopago.payment.create(payment_data);
};
```

## 🚀 6. Deploy em Produção

### Opção A: Deploy na Vercel (Recomendado para início)

#### Backend:
```bash
cd backend
npm install -g vercel
vercel

# Configurar variáveis de ambiente no dashboard
```

#### Frontend Web:
```bash
cd web-admin
npm run build
vercel --prod
```

### Opção B: Deploy na AWS

#### Preparar Docker:
```bash
# 1. Build das imagens
docker build -t guincho-backend ./backend
docker build -t guincho-web ./web-admin

# 2. Push para AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag guincho-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/guincho-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/guincho-backend:latest
```

#### Deploy com ECS:
```bash
# 3. Criar cluster
aws ecs create-cluster --cluster-name guincho-cluster

# 4. Registrar task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# 5. Criar service
aws ecs create-service --cluster guincho-cluster --service-name guincho-service
```

## 📱 7. Publicar na App Store / Google Play

### Android (Google Play):
```bash
cd mobile/android

# 1. Gerar chave de assinatura
keytool -genkey -v -keystore guincho-release-key.keystore -alias guincho-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 2. Configurar gradle.properties
MYAPP_RELEASE_STORE_FILE=guincho-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=guincho-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****

# 3. Build release
cd ..
npx react-native run-android --variant=release
```

### iOS (App Store):
```bash
# 1. Abrir no Xcode
open ios/GuinchoApp.xcworkspace

# 2. Configurar Bundle ID único
# 3. Configurar Apple Developer Account
# 4. Archive e Upload para App Store Connect
```

## 🔧 8. Monitoramento e Logs

### Sentry (Error Tracking):
```bash
npm install @sentry/react-native

# Configurar no mobile/src/App.tsx:
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
});
```

### Analytics:
```bash
# Google Analytics 4
npm install @react-native-google-analytics/google-analytics
```

## ✅ 9. Checklist de Produção

### Antes de Lançar:
- [ ] ✅ APIs de localização configuradas
- [ ] ✅ Banco de dados em produção
- [ ] ✅ Variáveis de ambiente configuradas  
- [ ] ✅ SSL/HTTPS configurado
- [ ] ✅ Notificações push funcionando
- [ ] ✅ Pagamentos integrados
- [ ] ✅ Testes de carga realizados
- [ ] ✅ Backup do banco configurado
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Apps publicadas nas lojas

### Configurações de Segurança:
- [ ] ✅ Rate limiting ativo
- [ ] ✅ CORS configurado
- [ ] ✅ JWT com expiração
- [ ] ✅ Validation em todas as rotas
- [ ] ✅ Logs de auditoria
- [ ] ✅ Firewall configurado

## 🆘 10. Troubleshooting Comum

### Erro de CORS:
```javascript
// backend/src/index.ts
app.use(cors({
  origin: ['http://localhost:3000', 'https://app.guinchoondemand.com'],
  credentials: true
}));
```

### Erro de localização no Android:
```xml
<!-- Adicionar em AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
```

### Erro de build iOS:
```bash
# Limpar cache
cd ios
rm -rf Pods
pod install --repo-update
```

---

## 📞 Suporte Técnico

Para dúvidas específicas de integração:
- 📧 Email: dev@guinchoondemand.com
- 💬 Discord: [Server de desenvolvedores]
- 📱 WhatsApp: +55 11 99999-9999

**🚀 Com essas integrações, seu sistema estará 100% funcional em produção!**