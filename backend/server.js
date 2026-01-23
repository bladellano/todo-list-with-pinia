import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

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

// Atualizar ordem das tarefas
app.put('/api/todos/order', async (req, res) => {
  const data = await readData();
  data.todoOrder = req.body.order;
  await writeData(data);
  res.json({ success: true });
});

app.get('/api/todos/order', async (req, res) => {
  const data = await readData();
  res.json(data.todoOrder || []);
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

// Iniciar servidor
await initDataFile();
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
