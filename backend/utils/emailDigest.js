function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function isEmailTask(todo) {
  return (
    todo.sendByEmail === true &&
    todo.done !== true &&
    todo.archived !== true &&
    Array.isArray(todo.emails) &&
    todo.emails.length > 0
  )
}

function shouldSendBySchedule(todo, now = new Date()) {
  if (todo.sendFrequency !== 'daily') return true

  const taskTime = todo.sendTime || '09:00'
  const [taskHour, taskMinute] = taskTime.split(':').map(Number)
  const taskMinutes = taskHour * 60 + taskMinute
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  return Math.abs(currentMinutes - taskMinutes) <= 5
}

export function buildEmailDigests(todos, { now = new Date() } = {}) {
  const tasksByRecipient = new Map()

  for (const task of todos) {
    if (!isEmailTask(task) || !shouldSendBySchedule(task, now)) continue

    for (const rawEmail of task.emails) {
      const email = rawEmail.trim()
      if (!email) continue

      const key = email.toLowerCase()
      if (!tasksByRecipient.has(key)) {
        tasksByRecipient.set(key, { email, tasks: [] })
      }

      const bucket = tasksByRecipient.get(key)
      if (!bucket.tasks.some(existing => existing.id === task.id)) {
        bucket.tasks.push(task)
      }
    }
  }

  const sentAt = now.toLocaleString('pt-BR')
  const digests = []

  for (const { email, tasks } of tasksByRecipient.values()) {
    const rows = tasks.map((task, index) => `
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; width: 48px;">${index + 1}</td>
        <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${escapeHtml(task.title)}</td>
      </tr>
    `).join('')

    const text = tasks.map((task, index) => `${index + 1}. ${task.title}`).join('\n')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #111827;">
        <h2 style="color: #2563eb; margin: 0 0 8px 0;">TaskMaster</h2>
        <p style="color: #6b7280; margin: 0 0 20px 0;">Tarefas pendentes (${tasks.length})</p>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
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
        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">Enviado em ${sentAt}</p>
      </div>
    `.trim()

    digests.push({
      to: email,
      subject: `TaskMaster — ${tasks.length} tarefa(s) pendente(s)`,
      text: `TaskMaster — Tarefas pendentes\n\n${text}\n\nEnviado em ${sentAt}`,
      html,
      taskCount: tasks.length
    })
  }

  return digests
}
