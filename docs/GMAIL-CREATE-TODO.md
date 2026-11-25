# Gmail `create-todo` → tarefas no app

Automação n8n que lê e-mails com assunto começando por `create-todo` e cria uma tarefa fixada para cada um. O mesmo slug não gera outra tarefa.

Vários e-mails no mesmo disparo vão num único `POST /api/external/todos/batch`. A API grava a lista inteira de uma vez. O e-mail só é marcado como lido quando a tarefa foi gravada (ou já existia). Se aquele item falhar, o n8n devolve o e-mail para não lido.

## Assunto do e-mail

| Assunto | Título da tarefa | Slug |
|--------|-------------------|------|
| `create-todo Comprar leite` | Comprar leite | `comprar-leite` |
| `CREATE-TODO Rever contrato` | Rever contrato | `rever-contrato` |

O corpo do e-mail vira a **descrição**. A tarefa entra **fixada**.

## API

```bash
curl -s -X POST https://cdns-systems-todo-server.ccuexx.easypanel.host/api/external/todos/batch \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"title":"Comprar leite","description":"2L","emailSlug":"comprar-leite","gmailMessageId":"msg-1"},
      {"title":"Pagar conta","description":"","emailSlug":"pagar-conta","gmailMessageId":"msg-2"}
    ]
  }'
```

Resposta `200`:

```json
{
  "results": [
    { "gmailMessageId": "msg-1", "ok": true, "created": true, "emailSlug": "comprar-leite", "todo": {} },
    { "gmailMessageId": "msg-2", "ok": true, "created": false, "emailSlug": "pagar-conta", "todo": {} }
  ]
}
```

`created: false` com `ok: true` significa que o slug já existia. `ok: false` é falha daquele item; os outros do lote ainda são gravados.

`POST /api/external/todos` continua aceitando um item só. Gravações externas passam por uma fila interna para não se sobrepor.

## n8n

1. Publique o backend com este endpoint.
2. Importe de novo [`Gmail-create-todo-from-inbox.json`](Gmail-create-todo-from-inbox.json), no lugar do fluxo que criava um POST por e-mail.
3. Confira a credencial do Gmail e o Header Auth (`Authorization: Bearer <API_KEY>`).
4. A busca é `in:inbox subject:create-todo newer_than:2d`. Os dois e-mails que ficaram só como lidos entram de novo nessa janela; o que já virou tarefa não é duplicado.

Códigos dos nodes, se for colar à mão:

- [`n8n/prepare-create-todo-from-gmail.js`](n8n/prepare-create-todo-from-gmail.js)
- [`n8n/separar-resultado-create-todo.js`](n8n/separar-resultado-create-todo.js)
