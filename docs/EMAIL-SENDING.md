# Envio de Tarefas por E-mail

Este documento descreve como configurar e utilizar a funcionalidade de envio automático de tarefas por e-mail através do n8n.

## 📋 Funcionalidades

### 1. Campo de E-mails
- Input com suporte a múltiplos destinatários
- Separação por `;` (ponto e vírgula) ou `Tab`
- Visualização como chips azuis
- Validação de formato de e-mail
- Remoção individual de destinatários

### 2. Opções de Envio

#### Enviar Apenas Uma Vez
- A tarefa será enviada uma única vez
- Ideal para lembretes pontuais ou comunicados únicos

#### Enviar Diariamente
- A tarefa será enviada todos os dias no horário configurado
- Útil para lembretes recorrentes ou relatórios diários
- Configuração de horário específico (formato 24h)

### 3. Integração com n8n

A funcionalidade utiliza flags específicas que podem ser consultadas via API:

```json
{
  "sendByEmail": true,
  "emails": ["destinatario1@example.com", "destinatario2@example.com"],
  "sendFrequency": "daily",
  "sendTime": "09:00"
}
```

## 🚀 Como Usar

### No Frontend

1. **Abra o modal de edição** da tarefa
2. **Marque** "Enviar por e-mail (via n8n)"
3. **Adicione destinatários**:
   - Digite o e-mail e pressione `Enter` ou `Tab`
   - Ou digite múltiplos e-mails separados por `;`
4. **Escolha a frequência**:
   - **Uma vez**: envio único
   - **Diariamente**: escolha o horário de envio
5. **Salve** a tarefa

### Exemplo Visual

```
┌─────────────────────────────────────────┐
│ ☑ Enviar por e-mail (via n8n)          │
├─────────────────────────────────────────┤
│ Destinatários:                          │
│ ┌───────────────────────────────────┐   │
│ │ [user@ex.com] [team@ex.com] ___   │   │
│ └───────────────────────────────────┘   │
│                                         │
│ Frequência:                             │
│ ○ Enviar apenas uma vez                 │
│ ● Enviar diariamente                    │
│                                         │
│ Horário: [09:00]                        │
└─────────────────────────────────────────┘
```

## 🔌 Integração n8n

### Endpoint para Consulta

```bash
GET /api/external/todos

# Exemplo: buscar tarefas notificáveis ou com envio por e-mail
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "http://localhost:3001/api/external/todos?notificable=true&done=false"
```

### Estrutura de Resposta

```json
[
  {
    "id": 1769951355244,
    "title": "Reunião Importante",
    "description": "Discussão sobre projeto X",
    "sendByEmail": true,
    "emails": [
      "gerente@empresa.com",
      "equipe@empresa.com"
    ],
    "sendFrequency": "daily",
    "sendTime": "09:00",
    "done": false,
    "archived": false
  }
]
```

### Workflow n8n Sugerido

```
1. [Cron] Trigger diário
   ↓
2. [HTTP Request] GET /api/external/todos?notificable=true&done=false
   ↓
3. [Code] Formatar Email — monta subject + body HTML (tabela só com títulos)
   ↓
4. [Email] Envia e-mail
   - Assunto: {{ $json.subject }}
   - Corpo HTML: {{ $json.body }}
```

### Node "Formatar Email"

A formatação do corpo do e-mail fica no n8n, no node **Formatar Email**. O código atualizado está em [`docs/n8n/formatar-email.js`](n8n/formatar-email.js).

Comportamento:
- Exibe **somente o título** de cada tarefa (sem descrição)
- Lista as tarefas em **tabela HTML** (`#` + `Título`), compatível com clientes de e-mail
- Escapa HTML nos títulos para evitar quebra de layout

Exemplo visual do corpo:

| # | Título |
|---|--------|
| 1 | Reunião com Cliente |
| 2 | Compreender doc do deploy.yml |

### Exemplo de Código n8n (HTTP Request)

**URL**: `http://localhost:3001/api/external/todos`

**Headers**:
```json
{
  "Authorization": "Bearer YOUR_API_KEY"
}
```

**Response Processing**:
```javascript
// Filtrar apenas tarefas com envio por e-mail
const tasksToSend = items.filter(item => {
  const task = item.json;
  return task.sendByEmail === true && !task.done && !task.archived;
});

// Para envio diário, verificar horário
const now = new Date();
const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

return tasksToSend.filter(item => {
  const task = item.json;
  if (task.sendFrequency === 'once') {
    return true; // Enviar uma vez
  }
  if (task.sendFrequency === 'daily') {
    return currentTime === task.sendTime;
  }
  return false;
});
```

### Exemplo de Envio de E-mail

**Send Email Node (n8n)** — após o node Formatar Email:

```
Assunto: {{ $json.subject }}
HTML:    {{ $json.body }}
```

## 📊 Campos de Dados

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `sendByEmail` | boolean | Sim | Se `true`, habilita envio por e-mail |
| `emails` | array | Sim* | Lista de destinatários (obrigatório se `sendByEmail = true`) |
| `sendFrequency` | string | Sim* | `"once"` ou `"daily"` (obrigatório se `sendByEmail = true`) |
| `sendTime` | string | Condicional | Formato `"HH:mm"`, obrigatório se `sendFrequency = "daily"` |

## ⚙️ Boas Práticas

### 1. Validação de E-mails
O sistema valida automaticamente:
- Formato de e-mail válido
- E-mails duplicados não são permitidos

### 2. Horários
- Use formato 24h: `"09:00"`, `"14:30"`, `"23:45"`
- Configure um buffer de minutos no n8n para evitar perder o horário exato

### 3. Controle de Envio Único
Para `sendFrequency = "once"`, adicione lógica no n8n para:
- Marcar a tarefa como enviada após o envio
- Ou adicionar um campo `lastSent` com timestamp

### 4. Tratamento de Erros
- Implemente retry logic no n8n para falhas de envio
- Registre logs de envios bem-sucedidos e falhas

## 🔒 Segurança

- **API Key**: Use sempre `Authorization: Bearer YOUR_API_KEY`
- **E-mails**: Valide destinatários antes de enviar
- **Rate Limiting**: Configure limites no n8n para evitar spam

## 🐛 Troubleshooting

### E-mails não estão sendo enviados

1. Verifique se `sendByEmail = true`
2. Confirme que a tarefa não está arquivada (`archived = false`)
3. Para envio diário, verifique se o horário está correto
4. Verifique logs do n8n para erros de SMTP

### E-mails duplicados

- Certifique-se de que o workflow n8n não está duplicado
- Verifique se o Cron trigger não está rodando muito frequentemente
- Adicione controle de envio único (flag `lastSent`)

### Formato de horário inválido

- Use sempre formato `"HH:mm"` (24 horas)
- Exemplos válidos: `"09:00"`, `"14:30"`, `"00:00"`, `"23:59"`

## 📚 Exemplos de Uso

### Exemplo 1: Lembrete de Reunião (Envio Único)

```json
{
  "title": "Reunião com Cliente X - Amanhã às 14h",
  "description": "## Pauta\n- Apresentação do projeto\n- Discussão de prazos\n- Fechamento de contrato",
  "sendByEmail": true,
  "emails": ["gerente@empresa.com", "vendedor@empresa.com"],
  "sendFrequency": "once"
}
```

### Exemplo 2: Relatório Diário (Envio Recorrente)

```json
{
  "title": "Relatório de Vendas Diário",
  "description": "Verificar dashboard de vendas e enviar resumo para equipe",
  "sendByEmail": true,
  "emails": ["gerente@empresa.com", "equipe@empresa.com"],
  "sendFrequency": "daily",
  "sendTime": "09:00"
}
```

## 🎯 Roadmap Futuro

Possíveis melhorias:

- [ ] Envio semanal (escolher dias da semana)
- [ ] Envio mensal (escolher dia do mês)
- [ ] Templates de e-mail personalizáveis
- [ ] Histórico de envios
- [ ] Estatísticas de abertura/cliques
- [ ] Anexar arquivos às tarefas

---

**Documentação atualizada em:** 01/02/2026
