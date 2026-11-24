// Cole no node n8n "Preparar create-todo" (Code) — após Gmail "Get Many".
// Entrada: itens do Gmail (subject, id, snippet, textPlain / text quando disponível).

const CREATE_TODO_PREFIX = /^create-todo\s*/i;

function normalizeEmailSlug(value) {
  if (value == null || typeof value !== 'string') return '';
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const output = [];

for (const item of $input.all()) {
  const msg = item.json;
  const subject = msg.subject || msg.Subject || '';

  if (!CREATE_TODO_PREFIX.test(subject)) {
    continue;
  }

  const title = subject.replace(CREATE_TODO_PREFIX, '').trim();
  if (!title) {
    continue;
  }

  const emailSlug = normalizeEmailSlug(title);
  if (!emailSlug) {
    continue;
  }

  const description =
    (msg.textPlain || msg.text || msg.snippet || '').trim();

  const messageId = msg.id || msg.messageId;
  if (!messageId) {
    continue;
  }

  output.push({
    json: {
      title,
      description,
      emailSlug,
      gmailMessageId: messageId
    }
  });
}

return output;