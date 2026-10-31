const state = {
  token: localStorage.getItem('techflowToken') || '',
  user: null
};

const companyNameEl = document.getElementById('companyName');
const totalClientsEl = document.getElementById('totalClients');
const totalEquipmentEl = document.getElementById('totalEquipment');
const totalOrdersEl = document.getElementById('totalOrders');
const pendingOrdersEl = document.getElementById('pendingOrders');
const ordersListEl = document.getElementById('ordersList');
const inventoryListEl = document.getElementById('inventoryList');
const orderClientIdEl = document.getElementById('orderClientId');
const orderEquipmentIdEl = document.getElementById('orderEquipmentId');
const authViewEl = document.getElementById('authView');
const appViewEl = document.getElementById('appView');
const loginErrorEl = document.getElementById('loginError');
const userBadgeEl = document.getElementById('userBadge');

async function fetchJson(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {})
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });

  if (response.status === 401) {
    state.token = '';
    localStorage.removeItem('techflowToken');
    showLogin();
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erro ao processar requisição');
  }

  return response.json();
}

function showLogin() {
  authViewEl.classList.remove('hidden');
  appViewEl.classList.add('hidden');
  loginErrorEl.textContent = '';
}

function showApp() {
  authViewEl.classList.add('hidden');
  appViewEl.classList.remove('hidden');
}

function renderOrders(orders) {
  if (!orders.length) {
    ordersListEl.innerHTML = '<p class="item-meta">Nenhuma ordem registrada.</p>';
    return;
  }

  ordersListEl.innerHTML = orders
    .slice(0, 5)
    .map(order => `
      <div class="item-row">
        <div>
          <strong>${order.title}</strong>
          <div class="item-meta">${order.clientName || 'Cliente'} • ${order.equipmentName || 'Equipamento'}</div>
        </div>
        <div class="item-meta">R$ ${Number(order.total || 0).toFixed(2)}</div>
        <span class="badge">${order.status}</span>
      </div>
    `)
    .join('');
}

function renderInventory(items) {
  if (!items.length) {
    inventoryListEl.innerHTML = '<p class="item-meta">Nenhum item em estoque.</p>';
    return;
  }

  inventoryListEl.innerHTML = items
    .slice(0, 5)
    .map(item => `
      <div class="item-row">
        <div>
          <strong>${item.name}</strong>
          <div class="item-meta">Qtd: ${item.quantity}</div>
        </div>
        <div class="item-meta">R$ ${Number(item.price || 0).toFixed(2)}</div>
        <span class="badge">${item.quantity > 0 ? 'Disponível' : 'Sem estoque'}</span>
      </div>
    `)
    .join('');
}

function fillSelect(select, items, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>` + items
    .map(item => `<option value="${item.id}">${item.name || `${item.brand} ${item.model}`}</option>`)
    .join('');
}

async function loadDashboard() {
  if (!state.token) {
    showLogin();
    return;
  }

  const [company, dashboard, clients, equipment, inventory] = await Promise.all([
    fetchJson('/api/company'),
    fetchJson('/api/dashboard'),
    fetchJson('/api/clients'),
    fetchJson('/api/equipment'),
    fetchJson('/api/inventory')
  ]);

  if (!company || !dashboard || !clients || !equipment || !inventory) {
    return;
  }

  userBadgeEl.textContent = state.user ? state.user.name : 'Usuário';
  companyNameEl.textContent = company.name || 'TechFlow';
  totalClientsEl.textContent = dashboard.totalClients;
  totalEquipmentEl.textContent = dashboard.totalEquipment;
  totalOrdersEl.textContent = dashboard.totalOrders;
  pendingOrdersEl.textContent = dashboard.pendingOrders;

  renderOrders(dashboard.recentOrders || []);
  renderInventory(inventory || []);

  fillSelect(orderClientIdEl, clients, 'Selecione o cliente');
  fillSelect(orderEquipmentIdEl, equipment, 'Selecione o equipamento');
}

async function initSession() {
  if (!state.token) {
    showLogin();
    return;
  }

  const user = await fetchJson('/api/me');

  if (!user) {
    return;
  }

  state.user = user;
  showApp();
  await loadDashboard();
}

async function submitLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetchJson('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (!response) {
      return;
    }

    state.token = response.token;
    state.user = response.user;
    localStorage.setItem('techflowToken', response.token);
    showApp();
    await loadDashboard();
    document.getElementById('loginForm').reset();
  } catch (error) {
    loginErrorEl.textContent = error.message || 'Erro ao fazer login.';
  }
}

async function handleLogout() {
  if (!state.token) {
    showLogin();
    return;
  }

  try {
    await fetchJson('/api/logout', { method: 'POST' });
  } catch (error) {
    console.error(error);
  }

  state.token = '';
  state.user = null;
  localStorage.removeItem('techflowToken');
  showLogin();
}

async function submitClient(event) {
  event.preventDefault();

  const payload = {
    name: document.getElementById('clientName').value,
    phone: document.getElementById('clientPhone').value,
    email: document.getElementById('clientEmail').value
  };

  const result = await fetchJson('/api/clients', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!result) {
    return;
  }

  event.target.reset();
  await loadDashboard();
}

async function submitOrder(event) {
  event.preventDefault();

  const payload = {
    clientId: orderClientIdEl.value,
    equipmentId: orderEquipmentIdEl.value,
    title: document.getElementById('orderTitle').value,
    status: document.getElementById('orderStatus').value,
    priority: document.getElementById('orderPriority').value,
    total: document.getElementById('orderTotal').value
  };

  const result = await fetchJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!result) {
    return;
  }

  event.target.reset();
  await loadDashboard();
}

document.getElementById('loginForm').addEventListener('submit', submitLogin);
document.getElementById('logoutBtn').addEventListener('click', handleLogout);
document.getElementById('clientForm').addEventListener('submit', submitClient);
document.getElementById('orderForm').addEventListener('submit', submitOrder);

initSession();
