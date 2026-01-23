# 💡 Exemplos de Uso

Este documento mostra exemplos práticos de como usar a aplicação.

---

## 🔐 1. Login

### Tela de Login
1. Acesse `http://localhost:5173`
2. Insira as credenciais:
   - **Usuário:** `admin`
   - **Senha:** `admin`
3. Clique em "Entrar"

✅ Você será redirecionado para a página principal

---

## 🏷️ 2. Criar Tags

### Passo a Passo
1. Clique em **"Configuração"** no menu
2. Digite o nome da tag no campo (ex: "Trabalho")
3. Clique em **"Adicionar"**

### Exemplos de Tags Úteis
- 🔥 Urgente
- 💼 Trabalho
- 🏠 Casa
- 📚 Estudos
- 💰 Financeiro
- 🎯 Importante
- 📅 Reunião
- ✈️ Viagem

---

## ✅ 3. Criar Tarefas

### Tarefa Simples
```
Título: Comprar leite
Descrição: (deixar vazio)
Tags: (nenhuma)
```

### Tarefa Completa
```
Título: Reunião com cliente
Descrição: Discutir proposta do novo projeto
Tags: Trabalho, Importante, Reunião
```

### Tarefa com Múltiplas Tags
```
Título: Pagar contas
Descrição: Energia, água e internet
Tags: Casa, Urgente, Financeiro
```

---

## 🎯 4. Editar Tarefa

1. Clique no ícone de **lápis** (✏️) na tarefa
2. Modal de edição será aberta
3. Modifique os campos desejados:
   - Título
   - Descrição
   - Tags (clique para adicionar/remover)
   - Status (concluída ou não)
4. Clique em **"Salvar"**

---

## ✔️ 5. Marcar como Concluída

### Método 1: Checkbox Rápido
- Clique no **checkbox** ao lado da tarefa
- A tarefa ficará riscada e opaca

### Método 2: Via Edição
1. Abra a edição da tarefa
2. Marque **"Tarefa concluída"**
3. Salve

---

## 🗑️ 6. Deletar Tarefa

1. Clique no ícone de **lixeira** (🗑️)
2. Confirme a exclusão
3. Tarefa será removida

⚠️ **Atenção:** Não há recuperação após deletar!

---

## 🔄 7. Reordenar Tarefas (Drag & Drop)

### Como Fazer
1. Posicione o mouse sobre os **3 pontos verticais** (⋮) à esquerda da tarefa
2. Clique e **arraste** para a posição desejada
3. Solte o mouse
4. A nova ordem será salva automaticamente

### Exemplo Visual
```
Antes:                  Depois:
1. Reunião             1. Pagar contas ⬆️
2. Comprar leite       2. Reunião
3. Pagar contas        3. Comprar leite ⬇️
```

---

## 🎨 8. Filtrar por Tags (Visualmente)

As tags aparecem como **badges coloridas** em cada tarefa:

```
┌─────────────────────────────────────┐
│ ☐ Reunião com cliente             │
│   Discutir proposta...             │
│   [Trabalho] [Importante]          │
│   23/01/2026 14:30                 │
└─────────────────────────────────────┘
```

---

## 📝 9. Fluxo Completo de Trabalho

### Cenário: Organizar a Semana

#### Etapa 1: Criar Tags
```
- Urgente
- Trabalho
- Casa
- Estudos
```

#### Etapa 2: Adicionar Tarefas
```
1. Fazer relatório mensal
   Tags: Trabalho, Urgente
   
2. Estudar Vue.js
   Tags: Estudos
   
3. Limpar casa
   Tags: Casa
   
4. Comprar presente aniversário
   Tags: Casa, Urgente
```

#### Etapa 3: Priorizar (Drag & Drop)
```
Ordem:
1. Fazer relatório mensal (Urgente + Trabalho)
2. Comprar presente (Urgente)
3. Estudar Vue.js
4. Limpar casa
```

#### Etapa 4: Executar
- Marque como concluída conforme finaliza
- Adicione novas tarefas que surgirem

---

## 🚀 10. Atalhos e Dicas

### Produtividade

**Use descrições claras:**
```
❌ Ruim:  "Fazer coisa"
✅ Bom:   "Revisar código do módulo de login"
```

**Tags consistentes:**
```
❌ Ruim:  "urgente", "Urgente!", "URGENTE"
✅ Bom:   "Urgente" (sempre igual)
```

**Seja específico:**
```
❌ Ruim:  "Estudar"
✅ Bom:   "Estudar capítulo 5 do livro de JavaScript"
```

### Organização

**Método GTD (Getting Things Done):**
- Tag "Hoje" para tarefas do dia
- Tag "Semana" para prazo semanal
- Tag "Algum dia" para ideias futuras

**Método Pomodoro:**
- Tag "25min" para tarefas rápidas
- Tag "1h" para tarefas médias
- Tag "2h+" para tarefas longas

---

## 📊 11. Exemplos Práticos

### Desenvolvedor
```
Tarefas:
□ Fix bug #234 - Login não funciona no Safari
  Tags: [Urgente] [Bug] [Frontend]
  
□ Code review PR #456
  Tags: [Trabalho] [Review]
  
□ Atualizar documentação da API
  Tags: [Documentação] [Backend]
```

### Estudante
```
Tarefas:
□ Ler capítulo 3 - Física Quântica
  Tags: [Estudos] [Física] [Prova]
  
□ Fazer exercícios de cálculo
  Tags: [Estudos] [Matemática] [Urgente]
  
□ Trabalho em grupo - História
  Tags: [Estudos] [Grupo] [Apresentação]
```

### Uso Pessoal
```
Tarefas:
□ Marcar dentista
  Tags: [Saúde] [Urgente]
  
□ Renovar CNH
  Tags: [Documentos] [Prazo]
  
□ Planejar viagem férias
  Tags: [Lazer] [Viagem]
```

---

## 🔧 12. Troubleshooting Comum

### Tarefa não salva?
✅ Verifique se o backend está rodando
✅ Abra o console do navegador (F12) para ver erros

### Ordem não persiste?
✅ Certifique-se de arrastar pela handle (⋮)
✅ Aguarde alguns segundos após soltar

### Tags não aparecem?
✅ Crie tags primeiro em "Configuração"
✅ Associe as tags ao criar/editar a tarefa

---

## 💾 13. Dados de Exemplo

### Importar Dados de Teste

Edite `backend/data.json`:

```json
{
  "users": [
    { "id": 1, "username": "admin", "password": "admin" }
  ],
  "todos": [
    {
      "id": 1,
      "title": "Fazer relatório mensal",
      "description": "Relatório de vendas de janeiro",
      "tagIds": [1, 2],
      "done": false,
      "createdAt": "2026-01-23T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Estudar Vue.js",
      "description": "Composition API e Pinia",
      "tagIds": [3],
      "done": false,
      "createdAt": "2026-01-23T11:00:00.000Z"
    },
    {
      "id": 3,
      "title": "Comprar presente",
      "description": "Aniversário da Maria",
      "tagIds": [1, 4],
      "done": true,
      "createdAt": "2026-01-23T09:00:00.000Z"
    }
  ],
  "tags": [
    { "id": 1, "name": "Urgente" },
    { "id": 2, "name": "Trabalho" },
    { "id": 3, "name": "Estudos" },
    { "id": 4, "name": "Casa" }
  ],
  "todoOrder": [1, 2, 3]
}
```

Reinicie o backend e recarregue a página.

---

## 🎉 Conclusão

Agora você sabe usar todos os recursos da aplicação!

**Próximos passos:**
1. Crie suas próprias tags
2. Adicione suas tarefas reais
3. Use diariamente para organização
4. Customize conforme necessário

**Dúvidas?**
Consulte a [documentação completa](../README.md)

---

**Bom trabalho! 🚀**
