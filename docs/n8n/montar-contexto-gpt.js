// Cole no node n8n "Montar Contexto GPT" (Function)
// Monta system + user message; o raciocínio fica no OpenAI (n8n), não no app Todo.

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

const tasksText = todos.length
  ? todos.map((t, i) => {
      const desc = (t.description || '').trim();
      const status = t.done ? 'concluída' : 'pendente';
      const pinned = t.pinned ? ', fixada' : '';
      return `${i + 1}. [${status}${pinned}] ${t.title}${desc ? `\n   Descrição: ${desc}` : ''}`;
    }).join('\n\n')
  : '(Nenhuma tarefa vinculada)';

const gptSystemMessage = `Você é o cérebro do serviço "Agents Agendados" do TaskMaster (app Todo List).
O operador define instruções em markdown no app; você recebe essas instruções e os dados das tarefas vinculadas.
Siga as instruções do operador, analise as tarefas e produza a resposta final para o usuário.

Regras:
- Responda em português do Brasil.
- Formate em HTML simples (parágrafos <p>, listas <ul>/<ol>, <strong>, <h3>) — sem tags <html>, <head> ou <body>.
- Seja objetivo e actionável.
- Não invente tarefas, prazos ou fatos que não estejam no contexto.
- Se não houver tarefas vinculadas, diga isso e responda com base só nas instruções, se fizer sentido.`;

const gptUserMessage = `# Instruções do agent (configuradas no app Todo)

${agent.prompt || '(sem instruções)'}

---

# Contexto do disparo
- Agent: ${agent.name}
- Data: ${agent.dispatchDate}
- Dia: ${weekdayLabel}

# Tarefas vinculadas

${tasksText}

---

Com base nas instruções acima, analise as tarefas e escreva o conteúdo principal do e-mail (HTML simples) que será enviado ao usuário.`;

return [{
  json: {
    agentId: agent.agentId,
    name: agent.name,
    dispatchDate: agent.dispatchDate,
    weekday: agent.weekday,
    weekdayLabel,
    prompt: agent.prompt,
    todos,
    gptSystemMessage,
    gptUserMessage
  }
}];
