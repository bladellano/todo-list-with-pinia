# 🚀 Guia Rápido de Início

## Opção 1: Iniciar Tudo de Uma Vez (Recomendado)

```bash
# Na raiz do projeto
npm run dev
```

Isso iniciará automaticamente:
- Backend em `http://localhost:3001`
- Frontend em `http://localhost:5173`

## Opção 2: Iniciar Separadamente

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## 📱 Acessar a Aplicação

Abra o navegador em: **http://localhost:5173**

**Credenciais padrão:**
- Usuário: `admin`
- Senha: `admin`

## 🎯 Próximos Passos

1. Faça login
2. Crie algumas tags em **Configuração**
3. Volte para **Início**
4. Adicione tarefas
5. Experimente arrastar e soltar para reordenar
6. Edite e marque tarefas como concluídas

## 📝 Comandos Úteis

### Raiz do Projeto
```bash
npm run dev              # Iniciar frontend e backend
npm run install:all      # Instalar todas as dependências
```

### Frontend (cd frontend)
```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build para produção
npm run preview          # Preview do build
```

### Backend (cd backend)
```bash
npm run dev              # Servidor com auto-reload
npm start                # Servidor sem auto-reload
```

## 🔍 Verificar se Está Funcionando

### Backend
```bash
curl http://localhost:3001/api/todos
# Deve retornar: []
```

### Frontend
Abra http://localhost:5173 no navegador

## ❗ Troubleshooting

### Porta já em uso?

**Backend (3001):**
```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Frontend (5173):**
```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Erro de CORS?
Verifique se o backend está rodando em `http://localhost:3001`

### Dados não persistem?
Verifique se o arquivo `backend/data.json` foi criado automaticamente

## 📂 Estrutura de Arquivos Importantes

```
todo/
├── backend/
│   ├── server.js         # Servidor principal
│   ├── data.json         # Dados (criado automaticamente)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── views/        # Páginas
│   │   ├── components/   # Componentes
│   │   ├── stores/       # Pinia stores
│   │   └── router/       # Rotas
│   └── package.json
└── package.json          # Scripts principais
```

## 🎉 Pronto!

Sua aplicação está rodando! Divirta-se organizando suas tarefas!

Para mais detalhes, consulte:
- [README.md](../README.md) - Documentação completa
- [ARQUITETURA.md](ARQUITETURA.md) - Detalhes técnicos
