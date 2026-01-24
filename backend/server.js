import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env na raiz do projeto
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Configurar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// Inicializar arquivo de dados se não existir
async function initDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData = {
      users: [
        { id: 1, username: 'admin', password: 'admin' }
      ],
      todos: [],
      tags: [],
      todoOrder: []
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Ler dados
async function readData() {
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

// Escrever dados
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Autenticação
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const data = await readData();
  
  const user = data.users.find(
    u => u.username === username && u.password === password
  );
  
  if (user) {
    res.json({ success: true, user: { id: user.id, username: user.username } });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

// CRUD de Todos
app.get('/api/todos', async (req, res) => {
  const data = await readData();
  res.json(data.todos);
});

app.post('/api/todos', async (req, res) => {
  const data = await readData();
  const newTodo = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  data.todos.push(newTodo);
  await writeData(data);
  res.json(newTodo);
});

// Rotas de ordem ANTES das rotas com :id
app.get('/api/todos/order', async (req, res) => {
  const data = await readData();
  res.json(data.todoOrder || []);
});

app.put('/api/todos/order', async (req, res) => {
  const data = await readData();
  data.todoOrder = req.body.order;
  await writeData(data);
  res.json({ success: true });
});

// Rotas com :id DEPOIS
app.put('/api/todos/:id', async (req, res) => {
  const data = await readData();
  const index = data.todos.findIndex(t => t.id === parseInt(req.params.id));
  
  if (index !== -1) {
    data.todos[index] = { ...data.todos[index], ...req.body };
    await writeData(data);
    res.json(data.todos[index]);
  } else {
    res.status(404).json({ message: 'Tarefa não encontrada' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  const data = await readData();
  data.todos = data.todos.filter(t => t.id !== parseInt(req.params.id));
  await writeData(data);
  res.json({ success: true });
});

// CRUD de Tags
app.get('/api/tags', async (req, res) => {
  const data = await readData();
  res.json(data.tags);
});

app.post('/api/tags', async (req, res) => {
  const data = await readData();
  const newTag = {
    id: Date.now(),
    ...req.body
  };
  data.tags.push(newTag);
  await writeData(data);
  res.json(newTag);
});

app.put('/api/tags/:id', async (req, res) => {
  const data = await readData();
  const index = data.tags.findIndex(t => t.id === parseInt(req.params.id));
  
  if (index !== -1) {
    data.tags[index] = { ...data.tags[index], ...req.body };
    await writeData(data);
    res.json(data.tags[index]);
  } else {
    res.status(404).json({ message: 'Tag não encontrada' });
  }
});

app.delete('/api/tags/:id', async (req, res) => {
  const data = await readData();
  data.tags = data.tags.filter(t => t.id !== parseInt(req.params.id));
  await writeData(data);
  res.json({ success: true });
});

// Exportar dados completos (backup)
app.get('/api/export', async (req, res) => {
  const data = await readData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=todo-backup-${Date.now()}.json`);
  res.json(data);
});

// Importar dados completos (restore)
app.post('/api/import', async (req, res) => {
  try {
    const importedData = req.body;
    
    // Validar estrutura básica
    if (!importedData.users || !importedData.todos || !importedData.tags) {
      return res.status(400).json({ 
        success: false, 
        message: 'Arquivo inválido. Estrutura de dados incorreta.' 
      });
    }
    
    // Validar se é um array
    if (!Array.isArray(importedData.users) || 
        !Array.isArray(importedData.todos) || 
        !Array.isArray(importedData.tags)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Arquivo inválido. Dados devem ser arrays.' 
      });
    }
    
    // Garantir que todoOrder existe
    if (!importedData.todoOrder) {
      importedData.todoOrder = [];
    }
    
    // Salvar dados importados
    await writeData(importedData);
    
    res.json({ 
      success: true, 
      message: 'Dados importados com sucesso!',
      stats: {
        users: importedData.users.length,
        todos: importedData.todos.length,
        tags: importedData.tags.length
      }
    });
  } catch (error) {
    console.error('Erro ao importar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar arquivo. Verifique o formato.' 
    });
  }
});

// Endpoint de IA para melhorar texto
app.post('/api/ai/improve-text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Texto não pode estar vazio' 
      });
    }
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return res.status(500).json({ 
        success: false, 
        message: 'OpenAI API key não configurada' 
      });
    }
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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
    });
    
    const improvedText = completion.choices[0]?.message?.content?.trim() || text;
    
    res.json({ 
      success: true, 
      original: text,
      improved: improvedText
    });
  } catch (error) {
    console.error('Erro ao melhorar texto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar texto com IA. Verifique sua API key.' 
    });
  }
});

// Iniciar servidor
await initDataFile();
app.listen(PORT, () => {
  console.log(`🚀 @todo Servidor rodando em http://localhost:${PORT}`);
});
