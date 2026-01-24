# ✅ Centralização dos Arquivos .env - Concluído

## 📋 Resumo das Alterações

Os arquivos `.env` foram centralizados em um único arquivo na raiz do projeto para facilitar deploys e melhorar a organização.

## 🗂️ Estrutura Anterior vs Nova

### ❌ Antes (Descentralizado)
```
todo/
├── backend/
│   └── .env          # Variáveis do backend
└── frontend/
    └── .env          # Variáveis do frontend
```

### ✅ Depois (Centralizado)
```
todo/
├── .env              # TODAS as variáveis aqui
├── .env.example      # Template para novos devs
├── backend/
│   └── server.js     # Lê de ../.env
└── frontend/
    └── vite.config.js # Lê de ../.env
```

## 📝 Arquivo .env Centralizado

Localização: `/Users/dellano/Projetos/todo/.env`

```env
# Backend
PORT=3001
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# Frontend
VITE_API_URL=http://localhost:3001
```

## 🔧 Modificações Realizadas

### 1. Backend (`backend/server.js`)
**Antes:**
```javascript
import 'dotenv/config'; // Lia .env do próprio diretório
```

**Depois:**
```javascript
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') }); // Lê da raiz
```

### 2. Frontend (`frontend/vite.config.js`)
**Antes:**
```javascript
export default defineConfig({
  plugins: [vue()],
})
```

**Depois:**
```javascript
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  envDir: path.resolve(__dirname, '..'), // Lê .env da raiz
})
```

### 3. Arquivo `.env.example` Criado
Template sem dados sensíveis para compartilhar com equipe e em repositórios.

## 🚀 Como Usar (Deploy)

### Desenvolvimento Local
```bash
# 1. Configure o .env na raiz (já está configurado)
# 2. Execute os servidores normalmente
npm run dev  # Na raiz: roda frontend e backend
```

### Deploy em Hospedagens

#### Vercel (Frontend)
```bash
# No painel da Vercel, adicione as variáveis:
VITE_API_URL=https://seu-backend.railway.app
```

#### Railway/Render (Backend)
```bash
# No painel da plataforma, adicione:
PORT=3001
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
```

#### Docker
```yaml
# docker-compose.yml
services:
  backend:
    env_file:
      - .env  # Lê direto da raiz
  frontend:
    env_file:
      - .env
```

## ✅ Benefícios

1. **Deploy Simplificado**: Uma única fonte de configuração
2. **Organização**: Todas as variáveis em um só lugar
3. **Manutenção**: Fácil de encontrar e editar
4. **Segurança**: `.gitignore` já configurado para ignorar `.env`
5. **Onboarding**: Novo desenvolvedor copia `.env.example` → `.env`

## 🛡️ Segurança

- ✅ `.env` já está no `.gitignore`
- ✅ `.env.example` não contém dados sensíveis
- ✅ API keys não são versionadas

## 🧪 Testes

Para garantir que tudo funciona:

1. **Parar os servidores ativos** (Ctrl+C em ambos terminais)
2. **Deletar os .env antigos** (opcional, mas recomendado):
   ```bash
   rm backend/.env frontend/.env
   ```
3. **Reiniciar os servidores**:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```
4. **Verificar logs**: Confirme que não há erros de variáveis não encontradas
5. **Testar funcionalidades**: Especialmente o botão de IA que usa `OPENAI_API_KEY`

## 📦 Próximos Passos (Opcional)

Para equipes maiores, considere:

1. **Vault/Secrets Manager**: HashiCorp Vault, AWS Secrets Manager
2. **Variáveis por Ambiente**: `.env.development`, `.env.production`
3. **Validação**: Script para validar variáveis obrigatórias
4. **CI/CD**: Injetar variáveis via pipeline

---

**Status**: ✅ Implementado e testável  
**Impacto**: Zero (retrocompatível)  
**Data**: 24/01/2026
