# Guincho On-demand - Tipos Compartilhados

Este diretório contém tipos TypeScript e utilitários compartilhados entre backend, mobile e web-admin.

## 📁 Estrutura

```
shared/
├── types/          # Definições de tipos TypeScript
├── utils/          # Utilitários compartilhados
├── constants/      # Constantes da aplicação
└── validations/    # Schemas de validação
```

## 🔄 Como Usar

### No Backend
```typescript
import { User, Ride } from '../shared/types';
import { validateEmail } from '../shared/utils';
```

### No Mobile
```typescript
import { User, Ride } from '../../shared/types';
import { formatCurrency } from '../../shared/utils';
```

### No Web Admin
```typescript
import { User, Ride } from '../shared/types';
import { formatDate } from '../shared/utils';
```

## 📦 Instalação como Pacote

Opcionalmente, este diretório pode ser publicado como um pacote npm privado para facilitar o versionamento e distribuição entre os projetos.