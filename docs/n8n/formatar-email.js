// Cole este código no node n8n "Formatar Email" (Code / Function)
// Exibe apenas títulos das tarefas em tabela HTML — sem descrição

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const rows = items.map((item, index) => {
  const task = item.json;
  return `
    <tr>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; width: 48px;">${index + 1}</td>
      <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${escapeHtml(task.title)}</td>
    </tr>
  `;
}).join('');

return [{
  json: {
    subject: `🔔 TaskMaster: Você tem ${items.length} tarefa(s) pendente(s)`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
        <p>Olá!</p>
        <p>Você tem <strong>${items.length}</strong> tarefa(s) que precisam da sua atenção:</p>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; margin: 16px 0;">
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
        <p>
          Acesse:
          <a href="https://todo-cndssystems.vercel.app/">https://todo-cndssystems.vercel.app/</a>
        </p>
        <p>Tenha um ótimo dia!</p>
      </div>
    `
  }
}];
