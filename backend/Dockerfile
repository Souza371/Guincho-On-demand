# Dockerfile para desenvolvimento
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    postgresql-client \
    curl

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npm run db:generate

# Expor a porta
EXPOSE 3000

# Comando padrão para desenvolvimento
CMD ["npm", "run", "dev"]