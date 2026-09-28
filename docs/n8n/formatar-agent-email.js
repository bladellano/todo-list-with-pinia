// Cole este código no node n8n "Formatar Email Agent" (Code / Function)
// Serviço: Agents Agendados — distinto da Notificação Diária de tarefas

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const agent = items[0].json;
const todos = Array.isArray(agent.todos) ? agent.todos : [];

const weekdayLabels = {
  sun: 'Domingo',
  mon: 'Segunda-feira',
  tue: 'Terça-feira',
  wed: 'Quarta-feira',
  thu: 'Quinta-feira',
  fri: 'Sexta-feira',
  sat: 'Sábado'
};
const weekdayLabel = weekdayLabels[agent.weekday] || agent.weekday || '';

const rows = todos.map((task, index) => `
    <tr>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; width: 48px;">${index + 1}</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${escapeHtml(task.title)}</td>
    </tr>
  `).join('');

const tasksBlock = todos.length
  ? `
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; margin: 8px 0 16px;">
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
  : '<p style="color: #6b7280; font-size: 14px;">Nenhuma tarefa vinculada a este agent.</p>';

return [{
  json: {
    subject: `🤖 TaskMaster Agents: ${agent.name} — ${agent.dispatchDate}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
        <div style="background: #ede9fe; border-left: 4px solid #7c3aed; padding: 12px 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #5b21b6; font-weight: bold;">
            Serviço: Agents Agendados
          </p>
          <p style="margin: 0; font-size: 14px; color: #4c1d95; line-height: 1.5;">
            Este e-mail <strong>não</strong> é a <em>Notificação Diária</em> de tarefas pendentes.
            É o disparo automático de um <strong>agent</strong> que você configurou no app
            (instruções em markdown + tarefas selecionadas + dias da semana).
          </p>
        </div>
        <h2 style="margin: 0 0 4px; font-size: 20px;">${escapeHtml(agent.name)}</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">${escapeHtml(weekdayLabel)} · ${escapeHtml(agent.dispatchDate)}</p>
        <h3 style="font-size: 14px; margin: 0 0 8px; color: #374151;">Instruções do agent</h3>
        <pre style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; white-space: pre-wrap; font-size: 13px; line-height: 1.45; margin: 0 0 20px;">${escapeHtml(agent.prompt)}</pre>
        <h3 style="font-size: 14px; margin: 0 0 8px; color: #374151;">Tarefas vinculadas (${todos.length})</h3>
        ${tasksBlock}
        <p style="font-size: 14px;">
          Configurar agents:
          <a href="https://todo-cndssystems.vercel.app/agents">https://todo-cndssystems.vercel.app/agents</a>
        </p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
          TaskMaster · workflow <strong>Agents Agendados</strong> (n8n)
        </p>
      </div>
    `
  }
}];
