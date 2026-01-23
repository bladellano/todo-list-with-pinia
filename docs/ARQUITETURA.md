# Documentação de Arquitetura - Todo List com Tags

## 📐 Visão Geral da Arquitetura

A aplicação segue uma arquitetura **cliente-servidor** simples, com separação clara de responsabilidades:

- **Frontend**: SPA (Single Page Application) Vue.js 3
- **Backend**: API REST com Node.js/Express
- **Persistência**: Arquivo JSON local

```
┌─────────────────────────────────────────┐
│           NAVEGADOR (Cliente)           │
│  ┌───────────────────────────────────┐  │
│  │         Vue.js 3 App             │  │
│  │  ┌────────────┬─────────────┐   │  │
│  │  │   Views    │  Components │   │  │
│  │  └────────────┴─────────────┘   │  │
│  │  ┌─────────────────────────┐   │  │
│  │  │    Pinia Stores         │   │  │
│  │  │  (Estado Global)        │   │  │
│  │  └─────────────────────────┘   │  │
│  │  ┌─────────────────────────┐   │  │
│  │  │    Vue Router           │   │  │
│  │  └─────────────────────────┘   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    │ HTTP/REST
                    │ (fetch API)
                    ▼
┌─────────────────────────────────────────┐
│      SERVIDOR (Node.js/Express)         │
│  ┌───────────────────────────────────┐  │
│  │         API REST                  │  │
│  │  /api/auth/*                      │  │
│  │  /api/todos/*                     │  │
│  │  /api/tags/*                      │  │
│  └───────────────────────────────────┘  │
│                    │                     │
│                    │ fs.promises         │
│                    ▼                     │
│  ┌───────────────────────────────────┐  │
│  │        data.json                  │  │
│  │  { users, todos, tags, order }    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🎯 Padrões e Práticas Adotadas

### Frontend

#### 1. **Composition API (Vue 3)**
Utiliza a Composition API com `<script setup>` para:
- Melhor organização do código
- Reutilização de lógica
- TypeScript-friendly
- Performance otimizada

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>
```

#### 2. **Gerenciamento de Estado com Pinia**

Três stores principais:

**authStore** (stores/auth.js)
- Gerencia autenticação do usuário
- Persiste sessão no localStorage
- Provê guards para rotas protegidas

**todoStore** (stores/todo.js)
- CRUD de tarefas
- Ordenação customizável
- Sincronização com backend

**tagStore** (stores/tag.js)
- CRUD de tags
- Lista de tags disponíveis

**Benefícios:**
- Estado centralizado e previsível
- Facilita debugging com DevTools
- Melhor testabilidade
- Sem prop drilling

#### 3. **Roteamento com Vue Router**

```javascript
routes: [
  { path: '/login', meta: { requiresGuest: true } },
  { path: '/', meta: { requiresAuth: true } },
  { path: '/tags', meta: { requiresAuth: true } }
]
```

**Guards de navegação:**
- `requiresAuth`: Requer autenticação
- `requiresGuest`: Apenas para não autenticados

#### 4. **Componentes Atômicos**

Seguindo princípios de componentização:

```
AppLayout.vue       → Layout wrapper (navbar + conteúdo)
TodoItem.vue        → Componente de tarefa individual
TodoEditModal.vue   → Modal reutilizável de edição
```

**Princípios:**
- Single Responsibility
- Reutilizável quando possível
- Props para entrada, Emits para saída

#### 5. **Estilização com Tailwind CSS**

**Por quê?**
- Desenvolvimento rápido
- Consistência visual
- Sem arquivos CSS gigantes
- Purge automático no build

**Classes utilitárias:**
```html
<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Botão
</button>
```

---

### Backend

#### 1. **API REST Simples**

Endpoints seguem convenções RESTful:

```
GET    /api/todos      → Listar
POST   /api/todos      → Criar
PUT    /api/todos/:id  → Atualizar
DELETE /api/todos/:id  → Deletar
```

#### 2. **Persistência em JSON**

**Operações:**
```javascript
// Leitura
const data = await fs.readFile(DATA_FILE, 'utf-8')
return JSON.parse(data)

// Escrita
await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
```

**Limitações:**
- Não é thread-safe
- Lê/escreve arquivo inteiro a cada operação
- Não escalável para muitos dados

**Por que é aceitável aqui?**
- Uso pessoal, não concorrente
- Simplicidade sobre performance
- Requisito do projeto

#### 3. **CORS Habilitado**

```javascript
app.use(cors())
```

Permite requisições do frontend (localhost:5173) para o backend (localhost:3000).

---

## 🔄 Fluxo de Dados

### Exemplo: Adicionar uma Nova Tarefa

```
1. Usuário preenche formulário
   ↓
2. HomeView.vue → handleAddTodo()
   ↓
3. todoStore.addTodo({ title, description, tagIds })
   ↓
4. HTTP POST → /api/todos
   ↓
5. Backend: server.js
   - Adiciona ID e timestamp
   - Salva em data.json
   - Retorna novo todo
   ↓
6. Store atualiza estado local
   ↓
7. Vue reage ao estado → UI atualiza
```

### Exemplo: Reordenar Tarefas (Drag & Drop)

```
1. Usuário arrasta tarefa
   ↓
2. SortableJS dispara evento onEnd
   ↓
3. HomeView.vue extrai nova ordem dos IDs
   ↓
4. todoStore.updateOrder([3, 1, 2])
   ↓
5. HTTP PUT → /api/todos/order
   ↓
6. Backend salva em data.todoOrder
   ↓
7. Computed sortedTodos recalcula ordem
   ↓
8. UI renderiza nova ordem
```

---

## 🗂️ Estrutura de Dados Completa

### data.json
```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "password": "admin"
    }
  ],
  "todos": [
    {
      "id": 1706023142345,
      "title": "Comprar leite",
      "description": "No supermercado perto de casa",
      "tagIds": [1, 3],
      "done": false,
      "createdAt": "2026-01-23T10:32:22.345Z"
    }
  ],
  "tags": [
    {
      "id": 1706023100000,
      "name": "Urgente"
    },
    {
      "id": 1706023110000,
      "name": "Trabalho"
    }
  ],
  "todoOrder": [1706023142345, 1706023200000]
}
```

### Tipos (TypeScript-like)

```typescript
interface User {
  id: number
  username: string
  password: string
}

interface Todo {
  id: number
  title: string
  description?: string
  tagIds: number[]
  done: boolean
  createdAt: string // ISO 8601
}

interface Tag {
  id: number
  name: string
}

interface AppData {
  users: User[]
  todos: Todo[]
  tags: Tag[]
  todoOrder: number[] // IDs em ordem customizada
}
```

---

## 🔐 Autenticação e Sessão

### Fluxo de Autenticação

```
┌─────────────┐     POST /api/auth/login      ┌─────────────┐
│  LoginView  │ ──────────────────────────────>│   Backend   │
│             │  { username, password }        │             │
│             │                                │   Valida    │
│             │ <──────────────────────────────│  credencial │
│             │  { success, user }             │             │
└─────────────┘                                └─────────────┘
      │
      │ authStore.login()
      ▼
┌─────────────────────────────┐
│ localStorage.setItem('user')│
│ { id, username }             │
└─────────────────────────────┘
      │
      │ router.push('/')
      ▼
┌─────────────┐
│  HomeView   │
└─────────────┘
```

### Guards de Rota

```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login') // Redireciona para login
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/') // Já autenticado, vai para home
  } else {
    next() // Permite navegação
  }
})
```

---

## 🎨 Design System Simples

### Cores Principais (Tailwind)

```
Primary:   blue-600  (#2563EB)
Hover:     blue-700  (#1D4ED8)
Success:   green-600 (#16A34A)
Danger:    red-600   (#DC2626)
Gray:      gray-100 a gray-800
```

### Componentes de UI Reutilizáveis

**Botões:**
```html
<!-- Primário -->
<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

<!-- Secundário -->
<button class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">

<!-- Perigo -->
<button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
```

**Inputs:**
```html
<input class="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent">
```

**Tags/Badges:**
```html
<span class="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
```

---

## ⚡ Performance e Otimizações

### Frontend

1. **Computed Properties para Ordenação**
   ```javascript
   const sortedTodos = computed(() => {
     // Recalcula apenas quando todos ou customOrder mudam
   })
   ```

2. **v-for com :key**
   ```vue
   <div v-for="todo in todos" :key="todo.id">
   ```

3. **Lazy Loading de Rotas** (futuro)
   ```javascript
   component: () => import('./views/HomeView.vue')
   ```

### Backend

1. **Inicialização Única do Arquivo**
   ```javascript
   await initDataFile() // Apenas no startup
   ```

2. **Operações Assíncronas**
   ```javascript
   const data = await readData() // Non-blocking
   ```

---

## 🧪 Testabilidade

### Estrutura Facilita Testes

**Stores Pinia:**
```javascript
import { setActivePinia, createPinia } from 'pinia'
import { useTodoStore } from '@/stores/todo'

describe('Todo Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('adds todo', async () => {
    const store = useTodoStore()
    await store.addTodo({ title: 'Test' })
    expect(store.todos).toHaveLength(1)
  })
})
```

**Componentes:**
```javascript
import { mount } from '@vue/test-utils'
import TodoItem from '@/components/TodoItem.vue'

it('renders todo title', () => {
  const wrapper = mount(TodoItem, {
    props: { todo: { title: 'Test', done: false } }
  })
  expect(wrapper.text()).toContain('Test')
})
```

---

## 🚀 Melhorias Futuras (Opcional)

### Curto Prazo
- [ ] Filtros de tarefas (todas, ativas, concluídas)
- [ ] Busca de tarefas por título
- [ ] Dark mode
- [ ] Testes unitários

### Médio Prazo
- [ ] Múltiplos usuários
- [ ] Banco de dados (SQLite)
- [ ] API com autenticação JWT
- [ ] PWA (Progressive Web App)

### Longo Prazo
- [ ] Sincronização em nuvem
- [ ] Aplicativo mobile (Vue Native)
- [ ] Colaboração em tempo real
- [ ] Analytics e estatísticas

---

## 📦 Dependências do Projeto

### Frontend
```json
{
  "vue": "^3.5.24",           // Framework
  "pinia": "^2.x",             // Estado
  "vue-router": "^4.x",        // Rotas
  "sortablejs": "^1.x",        // Drag & Drop
  "@vueuse/core": "^10.x",     // Utilitários Vue
  "tailwindcss": "^3.x"        // CSS Framework
}
```

### Backend
```json
{
  "express": "^4.18.2",        // Web framework
  "cors": "^2.8.5"             // CORS middleware
}
```

---

## 🎓 Conceitos Demonstrados

### Vue.js
✅ Composition API  
✅ Reactivity System  
✅ Component Communication (props/emits)  
✅ Lifecycle Hooks  
✅ Computed Properties  
✅ Watchers  

### JavaScript Moderno
✅ async/await  
✅ ES Modules  
✅ Destructuring  
✅ Spread Operator  
✅ Arrow Functions  

### Padrões de Design
✅ Repository Pattern (Stores)  
✅ Observer Pattern (Vue Reactivity)  
✅ Singleton (Pinia Stores)  
✅ Factory Pattern (Component Creation)  

### Arquitetura
✅ Separation of Concerns  
✅ Single Responsibility  
✅ DRY (Don't Repeat Yourself)  
✅ KISS (Keep It Simple, Stupid)  

---

**Documentação criada em:** 23 de Janeiro de 2026  
**Versão:** 1.0.0
