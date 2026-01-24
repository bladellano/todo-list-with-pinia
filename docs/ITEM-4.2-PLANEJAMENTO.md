# Planejamento: Item 4.2 - Botão "Melhorar Texto" com IA

## 📋 Objetivo
Adicionar um botão com ícone de estrela ao lado do campo de título da tarefa que, ao ser clicado, utiliza IA (OpenAI GPT-4o) para melhorar o texto e corrigir erros de ortografia e concordância.

---

## 🏗️ Arquitetura Atual

### Frontend (Vue 3 + Vite)
- **Componente principal**: `frontend/src/views/HomeView.vue`
- **Input de título**: Linha 10-25 (com autocomplete já implementado)
- **Estado**: Gerenciado por refs (`newTodo.title`)
- **Estrutura**: Input dentro de `<div class="relative">` para posicionamento absoluto

### Backend (Node.js + Express)
- **Servidor**: `backend/server.js`
- **Pattern de rotas**: `/api/{resource}`
- **Middleware**: CORS + express.json()
- **Bibliotecas existentes**: dotenv, express, cors, fs/promises

### Variáveis de Ambiente
- **Frontend**: `frontend/.env` → `VITE_API_URL`
- **Backend**: `backend/.env` → `PORT`

---

## 🎯 Implementação

### 1. Configuração (Backend)

#### 1.1. Adicionar dependência OpenAI
```bash
cd backend
npm install openai
```

#### 1.2. Configurar .env
Adicionar em `backend/.env`:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
```
> **Nota**: `gpt-4o-mini` é mais econômico que `gpt-4o` e suficiente para correção de texto.

#### 1.3. Criar endpoint API
Adicionar em `backend/server.js` (após as rotas existentes, antes do `app.listen`):

```javascript
// Importar no topo do arquivo
import OpenAI from 'openai';

// Configurar cliente OpenAI (após as outras configurações)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint para melhorar texto
app.post('/api/ai/improve-text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Texto não fornecido' });
    }
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente que melhora textos corrigindo erros de ortografia, gramática e concordância. Mantenha o significado original e seja conciso.'
        },
        {
          role: 'user',
          content: `Melhore o texto e seu entendimento: "${text}"`
        }
      ],
      max_tokens: 100,
      temperature: 0.3,
    });
    
    const improvedText = completion.choices[0].message.content.trim();
    
    res.json({ 
      original: text,
      improved: improvedText,
      success: true 
    });
    
  } catch (error) {
    console.error('Erro ao melhorar texto:', error);
    res.status(500).json({ 
      error: 'Erro ao processar texto com IA',
      success: false 
    });
  }
});
```

**Posicionamento**: Adicionar após as rotas de export/import, antes de `await initDataFile()`.

---

### 2. Frontend (Vue)

#### 2.1. Adicionar botão ao lado do input
Modificar `frontend/src/views/HomeView.vue`:

**Localização**: Substituir o `<div class="relative">` que contém o input de título (linhas 9-48).

```vue
<div class="relative">
  <!-- Container flex para input + botão -->
  <div class="flex items-center gap-2">
    <div class="relative flex-1">
      <input
        ref="titleInputRef"
        v-model="newTodo.title"
        type="text"
        placeholder="Digite uma nova tarefa..."
        required
        @input="handleTitleInput"
        @focus="showSuggestions = true"
        @blur="handleBlur"
        @keydown.down.prevent="navigateSuggestions(1)"
        @keydown.up.prevent="navigateSuggestions(-1)"
        @keydown.enter.prevent="selectCurrentSuggestion"
        @keydown.esc="closeSuggestions"
        class="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
      />
      
      <!-- Dropdown de sugestões (mantém igual) -->
      <div
        v-if="showSuggestions && filteredSuggestions.length > 0"
        class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors"
      >
        <!-- ... conteúdo do dropdown mantém igual ... -->
      </div>
    </div>
    
    <!-- Botão Melhorar Texto com IA -->
    <button
      type="button"
      @click="improveText"
      :disabled="!newTodo.title.trim() || isImprovingText"
      class="p-2 md:p-2.5 rounded-lg transition-colors flex-shrink-0"
      :class="isImprovingText 
        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' 
        : 'bg-yellow-500 hover:bg-yellow-600 text-white'"
      title="Melhorar texto com IA"
    >
      <svg v-if="!isImprovingText" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
      <!-- Spinner de loading -->
      <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </button>
  </div>
</div>
```

#### 2.2. Adicionar estado e função
No `<script setup>` de `HomeView.vue`, adicionar:

**Localização**: Após os estados de autocomplete (linha ~213).

```javascript
// Estado para melhorar texto
const isImprovingText = ref(false)

// Função para melhorar texto com IA
async function improveText() {
  if (!newTodo.value.title.trim()) return
  
  isImprovingText.value = true
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const response = await fetch(`${API_URL}/api/ai/improve-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newTodo.value.title })
    })
    
    const data = await response.json()
    
    if (data.success && data.improved) {
      newTodo.value.title = data.improved
      // Opcional: mostrar toast de sucesso
      console.log('✨ Texto melhorado:', data.improved)
    } else {
      throw new Error(data.error || 'Erro ao melhorar texto')
    }
  } catch (error) {
    console.error('Erro ao melhorar texto:', error)
    alert('Erro ao melhorar texto. Verifique sua conexão e tente novamente.')
  } finally {
    isImprovingText.value = false
  }
}
```

---

## 📁 Estrutura de Arquivos Modificados

```
backend/
├── .env                  # + OPENAI_API_KEY, OPENAI_MODEL
├── server.js             # + import OpenAI, + endpoint /api/ai/improve-text
└── package.json          # + dependência "openai"

frontend/
└── src/
    └── views/
        └── HomeView.vue  # + botão melhorar texto, + estado isImprovingText, + função improveText()
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Instalar `npm install openai` no backend
- [ ] Adicionar `OPENAI_API_KEY` e `OPENAI_MODEL` no `backend/.env`
- [ ] Importar biblioteca OpenAI no topo de `server.js`
- [ ] Configurar cliente OpenAI
- [ ] Criar endpoint POST `/api/ai/improve-text`
- [ ] Testar endpoint com Postman/curl

### Frontend
- [ ] Adicionar estado `isImprovingText` no HomeView
- [ ] Criar função `improveText()` no HomeView
- [ ] Modificar estrutura do input para adicionar botão ao lado
- [ ] Adicionar botão com ícone de estrela
- [ ] Testar integração com backend
- [ ] Validar estados de loading/erro

### Validação
- [ ] Botão desabilitado quando input vazio
- [ ] Botão mostra loading durante requisição
- [ ] Texto é atualizado após resposta da IA
- [ ] Erros são tratados adequadamente
- [ ] Dark mode funciona corretamente no botão

---

## 🔒 Segurança e Boas Práticas

1. **Não versionar chave da API**: Adicionar `.env` no `.gitignore`
2. **Limitar tokens**: `max_tokens: 100` para evitar custos excessivos
3. **Validar input**: Verificar texto não vazio no backend
4. **Rate limiting**: Considerar implementar limite de requisições (futuro)
5. **Temperature baixo**: `0.3` para respostas mais consistentes
6. **Timeout**: Frontend pode adicionar timeout na fetch (opcional)

---

## 💰 Custos Estimados (GPT-4o-mini)

- **Modelo**: `gpt-4o-mini`
- **Custo**: ~$0.00015 por 1K tokens de entrada
- **Estimativa**: ~$0.001 por 100 melhorias de texto
- **Muito econômico** para uso pessoal/pequeno

---

## 🚀 Próximos Passos (Opcional - Futuro)

1. Adicionar toast/notificação de sucesso (biblioteca `vue-toastification`)
2. Implementar cache de melhorias recentes
3. Adicionar opção de desfazer melhoria
4. Permitir configurar prompt personalizado
5. Suporte a outros modelos de IA (Anthropic Claude, etc.)

---

## 🐛 Troubleshooting

**Erro: "API key inválida"**
- Verificar `OPENAI_API_KEY` no `backend/.env`
- Confirmar que a chave é válida na OpenAI

**Erro: "CORS"**
- CORS já está habilitado no backend, mas verificar se `VITE_API_URL` está correto

**Botão não aparece**
- Verificar estrutura HTML do container flex
- Inspecionar no DevTools se classes Tailwind estão aplicadas

**Timeout/demora**
- Verificar conexão com a internet
- GPT-4o-mini é rápido (~1-2s), mas pode variar

---

## 📝 Notas Finais

- **Simplicidade**: Solução direta sem overengineering
- **Reutilização**: Usa estrutura de rotas e padrões já existentes
- **Manutenibilidade**: Código limpo e fácil de entender
- **Escalabilidade**: Fácil adicionar mais endpoints de IA no futuro
