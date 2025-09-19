# Guincho On-demand 🚛

Sistema completo de solicitação de guincho on-demand com aplicativo mobile e painel administrativo.

## 📋 Estrutura do Projeto

```
Guincho-On-demand/
├── backend/          # API REST Node.js + Express + PostgreSQL
├── mobile/           # App React Native (iOS/Android)
├── web-admin/        # Painel administrativo React.js
├── shared/           # Tipos TypeScript e utilitários compartilhados
└── docs/             # Documentação do projeto
```

## 🎯 Funcionalidades Principais

### Para Clientes
- ✅ Cadastro e login
- 📍 Localização por GPS
- 🛠️ Seleção de tipo de serviço (guincho leve/pesado, pneu, combustível, bateria)
- 📋 Lista de prestadores com preço, tempo e avaliação
- 🚨 Solicitação de socorro
- 📱 Rastreamento em tempo real
- 💳 Pagamento integrado (Pix, cartão, boleto)
- ⭐ Sistema de avaliação

### Para Prestadores (Guincheiros)
- ✅ Cadastro com documentação
- 🗺️ Definição de área de atendimento
- 📲 Recebimento de solicitações
- 💰 Envio de propostas de preço
- 🧭 Navegação GPS
- 💵 Recebimento direto no app
- 📊 Histórico e relatórios

### Para Administradores
- 👥 Gerenciamento de usuários
- ✅ Aprovação de documentos
- 📊 Relatórios completos
- 💼 Configuração de comissões
- 🔍 Monitoramento em tempo real

## 🛠️ Stack Tecnológica

- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Prisma
- **Mobile**: React Native, TypeScript
- **Web Admin**: React.js, TypeScript, Material-UI
- **Integrações**: Google Maps API, Firebase (push), Stripe/Mercado Pago
- **Deploy**: Docker, AWS/Azure

## 🚀 Como Executar

### Backend
```bash
cd backend
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx react-native run-android  # ou run-ios
```

### Web Admin
```bash
cd web-admin
npm install
npm start
```

## 📱 Screenshots

_Em desenvolvimento..._

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
