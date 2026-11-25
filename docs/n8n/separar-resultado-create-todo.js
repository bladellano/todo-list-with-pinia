// Cole no node n8n "Separar resultado" (Code), modo "Run Once for All Items".
// Uma saída por e-mail. ok=true só quando a tarefa foi gravada ou já existia.

const body = $input.first()?.json || {};
const results = Array.isArray(body.results) ? body.results : [];

return results
  .filter(result => result && result.gmailMessageId)
  .map(result => ({
    json: {
      gmailMessageId: result.gmailMessageId,
      ok: result.ok === true,
      created: result.created === true,
      emailSlug: result.emailSlug || '',
      error: result.error || ''
    }
  }));