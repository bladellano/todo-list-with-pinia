// Cole no node n8n "Preparar create-todo" (Code), modo "Run Once for All Items".
// Junta todos os e-mails do evento numa única lista para um só POST.

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

const items = [];

for (const item of $input.all()) {
  const msg = item.json;
  const subject = msg.subject || msg.Subject || '';

  if (!CREATE_TODO_PREFIX.test(subject)) continue;

  const title = subject.replace(CREATE_TODO_PREFIX, '').trim();
  if (!title) continue;

  const emailSlug = normalizeEmailSlug(title);
  if (!emailSlug) continue;

  const messageId = msg.id || msg.messageId;
  if (!messageId) continue;

  items.push({
    title,
    description: (msg.textPlain || msg.text || msg.snippet || '').trim(),
    emailSlug,
    gmailMessageId: messageId
  });
}

if (items.length === 0) return [];

return [{ json: { items } }];