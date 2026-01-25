import OpenAI from 'openai'

export function setupAIRoutes(app, apiKey, model = 'gpt-4o-mini') {
  const openai = new OpenAI({ apiKey })

  app.post('/api/ai/improve-text', async (req, res) => {
    try {
      const { text } = req.body
      
      if (!text || text.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: 'Texto não pode estar vazio' 
        })
      }
      
      if (!apiKey || apiKey === 'your-openai-api-key-here') {
        return res.status(500).json({ 
          success: false, 
          message: 'OpenAI API key não configurada' 
        })
      }
      
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente que melhora textos em português. Corrija erros de ortografia, gramática e concordância. Mantenha o significado original e seja conciso. Retorne apenas o texto melhorado, sem explicações.'
          },
          {
            role: 'user',
            content: `Melhore o texto e seu entendimento: "${text}"`
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      })
      
      const improvedText = completion.choices[0]?.message?.content?.trim() || text
      
      res.json({ 
        success: true, 
        original: text,
        improved: improvedText
      })
    } catch (error) {
      console.error('Erro ao melhorar texto:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao processar texto com IA. Verifique sua API key.' 
      })
    }
  })
}
