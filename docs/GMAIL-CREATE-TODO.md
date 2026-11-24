# Gmail `create-todo` → tarefas no app

Automação n8n que lê e-mails com assunto começando por `create-todo`, cria tarefas no Todo App e evita duplicatas pelo campo `emailSlug`.

## Assunto do e-mail

| Assunto | Título da tarefa | Slug |
|--------|-------------------|------|
| `create-todo Comprar leite` | Comprar leite | `comprar-leite` |
| `CREATE-TODO Rever contrato` | Rever contrato | `rever-contrato` |

O corpo do e-mail vira a **descrição** (texto puro ou snippet). A tarefa é criada já **fixada** (`pinned: true`), no topo da lista.

## API

```bash
# Criar (idempotente por emailSlug)
curl -s -X POST http://localhost:3001/api/external/todos \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Comprar leite","description":"2L","emailSlug":"comprar-leite"}'

# Consultar por slug
curl -s -H "Authorization: Bearer YOUR_API_KEY" \
  "http://localhost:3001/api/external/todos?emailSlug=comprar-leite"
```

Resposta ao criar: `201` com `{ "created": true, "todo": { ... } }`.  
Se o slug já existir: `200` com `{ "created": false, "todo": { ... } }`.

## n8n

1. Importe [`Gmail-create-todo-from-inbox.json`](Gmail-create-todo-from-inbox.json).
2. Ajuste a URL do node **Criar tarefa no app** (produção: mesma base do `VITE_API_URL` / servidor).
3. Credenciais:
   - **Gmail OAuth2** (mesma conta a monitorar).
   - **Header Auth - Todo**: header `Authorization` = `Bearer <API_KEY>` (igual aos outros workflows).
4. Código do node **Preparar create-todo** (cópia manual): [`n8n/prepare-create-todo-from-gmail.js`](n8n/prepare-create-todo-from-gmail.js).

Busca Gmail: `in:inbox subject:create-todo is:unread`. Após sucesso na API, a mensagem é marcada como lida.