const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const sessions = new Map();

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const seed = {
      company: {
        name: 'TechFlow',
        phone: '(11) 4002-8922',
        address: 'Rua da Manutenção, 123',
        email: 'contato@techflow.com.br'
      },
      clients: [
        {
          id: 1,
          name: 'João da Silva',
          phone: '(11) 99999-1111',
          email: 'joao@email.com',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Maria Oliveira',
          phone: '(11) 98888-2222',
          email: 'maria@email.com',
          createdAt: new Date().toISOString()
        }
      ],
      equipment: [
        {
          id: 1,
          clientId: 1,
          brand: 'Dell',
          model: 'Inspiron 15',
          serial: 'DL-001',
          issue: 'Não liga',
          status: 'Em diagnóstico',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          clientId: 2,
          brand: 'Samsung',
          model: 'Galaxy A54',
          serial: 'SM-154',
          issue: 'Tela trincada',
          status: 'Aguardando peça',
          createdAt: new Date().toISOString()
        }
      ],
      orders: [
        {
          id: 1,
          clientId: 1,
          equipmentId: 1,
          title: 'Diagnóstico de notebook',
          status: 'Em andamento',
          priority: 'Alta',
          total: 250,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          clientId: 2,
          equipmentId: 2,
          title: 'Substituição de tela',
          status: 'Aguardando peça',
          priority: 'Média',
          total: 420,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      inventory: [
        { id: 1, name: 'Tela Dell Inspiron 15', quantity: 2, price: 320 },
        { id: 2, name: 'Bateria Samsung A54', quantity: 1, price: 180 },
        { id: 3, name: 'Teclado Logitech K380', quantity: 6, price: 120 }
      ],
      users: [
        {
          id: 1,
          username: 'admin',
          password: 'admin123',
          name: 'Administrador',
          role: 'admin'
        },
        {
          id: 2,
          username: 'tecnico',
          password: 'tecnico123',
          name: 'Técnico',
          role: 'technician'
        }
      ]
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  }
}

function readData() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function makeId(list) {
  return list.length ? Math.max(...list.map(item => Number(item.id || 0))) + 1 : 1;
}

function normalizeToken(rawToken) {
  if (!rawToken) return null;
  return rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
}

function authenticate(req, res, next) {
  const token = normalizeToken(req.headers.authorization);

  if (!token || !sessions.has(token)) {
    return res.status(401).json({ message: 'Não autorizado. Faça login para continuar.' });
  }

  req.user = sessions.get(token);
  next();
}

function createSession(user) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { id: user.id, username: user.username, name: user.name, role: user.role });
  return token;
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
  }

  const data = readData();
  const existingUser = (data.users || []).find(
    user => user.username === username && user.password === password
  );

  if (!existingUser) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = createSession(existingUser);

  return res.json({
    token,
    user: {
      id: existingUser.id,
      username: existingUser.username,
      name: existingUser.name,
      role: existingUser.role
    }
  });
});

app.get('/api/me', authenticate, (req, res) => {
  res.json(req.user);
});

app.post('/api/logout', authenticate, (req, res) => {
  const token = normalizeToken(req.headers.authorization);
  sessions.delete(token);
  res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'TechFlow' });
});

app.get('/api/company', authenticate, (req, res) => {
  const data = readData();
  res.json(data.company);
});

app.get('/api/dashboard', authenticate, (req, res) => {
  const data = readData();
  const pendingOrders = data.orders.filter(order => order.status !== 'Finalizado').length;
  const totalValue = data.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  const recentOrders = [...data.orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(order => {
      const client = data.clients.find(c => c.id === Number(order.clientId));
      const equipment = data.equipment.find(e => e.id === Number(order.equipmentId));

      return {
        ...order,
        clientName: client ? client.name : 'Cliente não informado',
        equipmentName: equipment ? `${equipment.brand} ${equipment.model}` : 'Equipamento não informado'
      };
    });

  res.json({
    totalClients: data.clients.length,
    totalEquipment: data.equipment.length,
    totalOrders: data.orders.length,
    pendingOrders,
    totalValue,
    inventoryItems: data.inventory.length,
    recentOrders
  });
});

app.get('/api/clients', authenticate, (req, res) => {
  const data = readData();
  res.json(data.clients);
});

app.post('/api/clients', authenticate, (req, res) => {
  const data = readData();
  const { name, phone, email } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Nome e telefone são obrigatórios.' });
  }

  const newClient = {
    id: makeId(data.clients),
    name,
    phone,
    email: email || '',
    createdAt: new Date().toISOString()
  };

  data.clients.push(newClient);
  writeData(data);
  res.status(201).json(newClient);
});

app.get('/api/equipment', authenticate, (req, res) => {
  const data = readData();
  res.json(data.equipment);
});

app.post('/api/equipment', authenticate, (req, res) => {
  const data = readData();
  const { clientId, brand, model, serial, issue, status } = req.body;

  if (!clientId || !brand || !model || !issue) {
    return res.status(400).json({ message: 'Cliente, marca, modelo e problema são obrigatórios.' });
  }

  const newEquipment = {
    id: makeId(data.equipment),
    clientId: Number(clientId),
    brand,
    model,
    serial: serial || '',
    issue,
    status: status || 'Em diagnóstico',
    createdAt: new Date().toISOString()
  };

  data.equipment.push(newEquipment);
  writeData(data);
  res.status(201).json(newEquipment);
});

app.get('/api/orders', authenticate, (req, res) => {
  const data = readData();
  res.json(data.orders);
});

app.post('/api/orders', authenticate, (req, res) => {
  const data = readData();
  const { clientId, equipmentId, title, status, priority, total } = req.body;

  if (!clientId || !equipmentId || !title) {
    return res.status(400).json({ message: 'Cliente, equipamento e título são obrigatórios.' });
  }

  const newOrder = {
    id: makeId(data.orders),
    clientId: Number(clientId),
    equipmentId: Number(equipmentId),
    title,
    status: status || 'Em andamento',
    priority: priority || 'Média',
    total: Number(total || 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.orders.push(newOrder);
  writeData(data);
  res.status(201).json(newOrder);
});

app.get('/api/inventory', authenticate, (req, res) => {
  const data = readData();
  res.json(data.inventory);
});

app.post('/api/inventory', authenticate, (req, res) => {
  const data = readData();
  const { name, quantity, price } = req.body;

  if (!name || !quantity) {
    return res.status(400).json({ message: 'Nome e quantidade são obrigatórios.' });
  }

  const newItem = {
    id: makeId(data.inventory),
    name,
    quantity: Number(quantity),
    price: Number(price || 0)
  };

  data.inventory.push(newItem);
  writeData(data);
  res.status(201).json(newItem);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TechFlow rodando em http://localhost:${PORT}`);
});
