// Cole no node n8n "Formatar Email Agent" (Function) — após o node OpenAI
// Usa a resposta do GPT + metadados do node "Montar Contexto GPT"

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractGptHtml(item) {
  const raw = item.text
    || item.output
    || item.message?.content
    || item.choices?.[0]?.message?.content
    || '';

  const trimmed = String(raw).trim();
  if (!trimmed) {
    return '<p style="color:#b91c1c;">Não foi possível obter resposta do modelo OpenAI.</p>';
  }

  if (/<p[\s>]/i.test(trimmed) || /<ul[\s>]/i.test(trimmed) || /<h3[\s>]/i.test(trimmed)) {
    return trimmed;
  }

  return `<p style="white-space: pre-wrap; line-height: 1.5;">${escapeHtml(trimmed)}</p>`;
}

const ctx = $node['Montar Contexto GPT'].json;
const gptHtml = extractGptHtml(items[0].json);
const todos = Array.isArray(ctx.todos) ? ctx.todos : [];

const rows = todos.map((task, index) => `
    <tr>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; width: 48px;">${index + 1}</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${escapeHtml(task.title)}</td>
    </tr>
  `).join('');

const tasksBlock = todos.length
  ? `
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; margin: 8px 0 0;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 10px 12px; border: 1px solid #e5e7eb; text-align: left; width: 48px;">#</th>
              <th style="padding: 10px 12px; border: 1px solid #e5e7eb; text-align: left;">Título</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `
  : '';

return [{
  json: {
    subject: `🤖 TaskMaster Agents: ${ctx.name} — ${ctx.dispatchDate}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
        <div style="background: #ede9fe; border-left: 4px solid #7c3aed; padding: 12px 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #5b21b6; font-weight: bold;">
            Serviço: Agents Agendados
          </p>
          <p style="margin: 0; font-size: 14px; color: #4c1d95; line-height: 1.5;">
            Este e-mail <strong>não</strong> é a <em>Notificação Diária</em> de tarefas pendentes.
            O conteúdo abaixo foi <strong>gerado pelo GPT no n8n</strong> a partir das instruções do agent e das tarefas vinculadas no app.
          </p>
        </div>
        <h2 style="margin: 0 0 4px; font-size: 20px;">${escapeHtml(ctx.name)}</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">${escapeHtml(ctx.weekdayLabel)} · ${escapeHtml(ctx.dispatchDate)}</p>
        <h3 style="font-size: 14px; margin: 0 0 12px; color: #374151;">Análise do agent (GPT)</h3>
        <div style="font-size: 15px; line-height: 1.55; color: #111827;">
          ${gptHtml}
        </div>
        ${todos.length ? `
        <details style="margin-top: 24px; font-size: 13px; color: #6b7280;">
          <summary style="cursor: pointer; font-weight: 600; color: #374151;">Referência: tarefas vinculadas (${todos.length})</summary>
          ${tasksBlock}
        </details>
        ` : ''}
        <details style="margin-top: 16px; font-size: 13px; color: #6b7280;">
          <summary style="cursor: pointer; font-weight: 600; color: #374151;">Referência: instruções originais (app)</summary>
          <pre style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; white-space: pre-wrap; font-size: 12px; margin-top: 8px;">${escapeHtml(ctx.prompt)}</pre>
        </details>
        <p style="font-size: 14px; margin-top: 24px;">
          Configurar agents:
          <a href="https://todo-cndssystems.vercel.app/agents">https://todo-cndssystems.vercel.app/agents</a>
        </p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
          TaskMaster · workflow <strong>Agents Agendados</strong> · processamento OpenAI no n8n
        </p>
      </div>
    `
  }
}];
