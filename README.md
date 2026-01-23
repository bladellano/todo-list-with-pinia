# Todo List com Tags

Aplicação web simples de lista de tarefas com suporte a tags, desenvolvida com Vue.js 3, Tailwind CSS e Node.js.

## � Documentação

- **[QUICK-START.md](docs/QUICK-START.md)** - Guia rápido para iniciar a aplicação
- **[ARQUITETURA.md](docs/ARQUITETURA.md)** - Documentação técnica detalhada
- **[EXEMPLOS-USO.md](docs/EXEMPLOS-USO.md)** - Exemplos práticos de uso
- **[RESUMO-IMPLEMENTACAO.md](docs/RESUMO-IMPLEMENTACAO.md)** - Checklist de implementação

## 🚀 Início Rápido

```bash
# Instalar dependências (primeira vez)
npm run install:all

# Iniciar aplicação (frontend + backend)
npm run dev
```

**Acesse:** http://localhost:5173

**Login:** usuário `admin` / senha `admin`

## �📋 Funcionalidades

- ✅ Autenticação simples
- ✅ CRUD completo de tarefas
- ✅ CRUD completo de tags
- ✅ Associação de múltiplas tags às tarefas
- ✅ Reordenação de tarefas via drag and drop
- ✅ Marcar tarefas como concluídas
- ✅ Persistência de dados em arquivo JSON local
- ✅ Interface responsiva com Tailwind CSS

## 🏗️ Arquitetura

### Frontend (Vue.js 3 + Vite)

```
frontend/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── AppLayout.vue     # Layout principal com menu
│   │   ├── TodoItem.vue      # Item individual de tarefa
│   │   └── TodoEditModal.vue # Modal de edição
│   ├── stores/               # Stores Pinia
│   │   ├── auth.js          # Gerenciamento de autenticação
│   │   ├── todo.js          # Gerenciamento de tarefas
│   │   └── tag.js           # Gerenciamento de tags
│   ├── views/                # Páginas da aplicação
│   │   ├── LoginView.vue    # Página de login
│   │   ├── HomeView.vue     # Página principal (tarefas)
│   │   └── TagsView.vue     # Página de configuração de tags
│   ├── router/
│   │   └── index.js         # Configuração de rotas
│   ├── App.vue              # Componente raiz
│   ├── main.js              # Ponto de entrada
│   └── style.css            # Estilos Tailwind
└── ...
```

### Backend (Node.js + Express)

```
backend/
├── server.js                 # Servidor Express com API REST
├── data.json                 # Arquivo de dados (não versionado)
└── package.json
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### 1. Instalar dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Iniciar o Backend

```bash
cd backend
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### 3. Iniciar o Frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### 4. Acessar a Aplicação

Abra o navegador em `http://localhost:5173` e faça login com:

- **Usuário:** admin
- **Senha:** admin

## 📚 Tecnologias Utilizadas

### Frontend
- **Vue.js 3** - Framework JavaScript progressivo
- **Vite** - Build tool rápida
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento
- **Tailwind CSS** - Framework CSS utility-first
- **SortableJS** - Biblioteca para drag and drop
- **@vueuse/core** - Coleção de composables Vue

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web minimalista
- **CORS** - Middleware para habilitar CORS

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Fazer login

### Tarefas
- `GET /api/todos` - Listar todas as tarefas
- `POST /api/todos` - Criar nova tarefa
- `PUT /api/todos/:id` - Atualizar tarefa
- `DELETE /api/todos/:id` - Deletar tarefa
- `GET /api/todos/order` - Obter ordem personalizada
- `PUT /api/todos/order` - Atualizar ordem personalizada

### Tags
- `GET /api/tags` - Listar todas as tags
- `POST /api/tags` - Criar nova tag
- `PUT /api/tags/:id` - Atualizar tag
- `DELETE /api/tags/:id` - Deletar tag

**Base URL:** `http://localhost:3001/api`

## 💾 Estrutura de Dados

### data.json

```json
{
  "users": [
    { "id": 1, "username": "admin", "password": "admin" }
  ],
  "todos": [
    {
      "id": 1234567890,
      "title": "Título da tarefa",
      "description": "Descrição opcional",
      "tagIds": [1, 2],
      "done": false,
      "createdAt": "2026-01-23T00:00:00.000Z"
    }
  ],
  "tags": [
    {
      "id": 1234567890,
      "name": "Importante"
    }
  ],
  "todoOrder": [3, 1, 2]
}
```

## 🎨 Fluxo da Aplicação

### 1. Login
- Usuário acessa `/login`
- Insere credenciais
- Sistema valida e armazena sessão no localStorage
- Redireciona para página principal

### 2. Página Principal (Tarefas)
- Exibe lista de tarefas ordenadas
- Permite adicionar novas tarefas com tags
- Permite editar, deletar e marcar como concluída
- Permite reordenar via drag and drop
- Ordem personalizada é persistida

### 3. Configuração (Tags)
- CRUD completo de tags
- Edição inline de tags
- Confirmação antes de deletar

### 4. Logout
- Limpa sessão do localStorage
- Redireciona para tela de login

## 📝 Decisões Técnicas

### Por que Vue.js 3?
- Framework moderno com Composition API
- Excelente integração com Vite para desenvolvimento rápido
- Ecossistema maduro (Pinia, Vue Router)

### Por que Pinia?
- Sucessor oficial do Vuex
- API mais simples e intuitiva
- TypeScript-friendly
- Melhor integração com DevTools

### Por que SortableJS?
- Biblioteca madura e estável para drag and drop
- Leve e sem dependências pesadas
- Fácil integração com Vue

### Por que persistir em JSON?
- Requisito do projeto
- Simples para uso pessoal
- Não requer configuração de banco de dados
- Fácil de fazer backup

### Por que Node.js/Express?
- Linguagem JavaScript unificada (fullstack)
- Express é minimalista e direto ao ponto
- Fácil de entender e manter

## ⚠️ Limitações

- Autenticação simples sem criptografia (apenas para uso pessoal)
- Sem suporte a múltiplos usuários simultâneos
- Arquivo JSON não é thread-safe (pode haver conflitos em escritas simultâneas)
- Não é recomendado para produção ou uso em equipe

## 🔒 Segurança

**IMPORTANTE:** Esta aplicação foi desenvolvida para uso pessoal e não implementa práticas avançadas de segurança:

- Senhas armazenadas em texto plano
- Sem tokens JWT ou sessões seguras
- Sem proteção contra CSRF
- Sem rate limiting

**Não use em produção ou com dados sensíveis.**

## 📦 Build para Produção

### Frontend
```bash
cd frontend
npm run build
```

Os arquivos otimizados estarão em `frontend/dist/`

### Backend
O backend não requer build, pode ser executado diretamente com:
```bash
cd backend
npm start
```

## 🤝 Contribuindo

Este é um projeto pessoal simples. Caso queira melhorá-lo:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é livre para uso pessoal e educacional.

---

**Desenvolvido com ❤️ usando Vue.js e Node.js**
