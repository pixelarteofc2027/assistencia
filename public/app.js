const companyNameEl = document.getElementById('companyName');
const totalClientsEl = document.getElementById('totalClients');
const totalEquipmentEl = document.getElementById('totalEquipment');
const totalOrdersEl = document.getElementById('totalOrders');
const pendingOrdersEl = document.getElementById('pendingOrders');
const ordersListEl = document.getElementById('ordersList');
const inventoryListEl = document.getElementById('inventoryList');
const orderClientIdEl = document.getElementById('orderClientId');
const orderEquipmentIdEl = document.getElementById('orderEquipmentId');

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erro ao processar requisição');
  }

  return response.json();
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
  try {
    const [company, dashboard, clients, equipment, inventory] = await Promise.all([
      fetchJson('/api/company'),
      fetchJson('/api/dashboard'),
      fetchJson('/api/clients'),
      fetchJson('/api/equipment'),
      fetchJson('/api/inventory')
    ]);

    companyNameEl.textContent = company.name || 'TechFlow';
    totalClientsEl.textContent = dashboard.totalClients;
    totalEquipmentEl.textContent = dashboard.totalEquipment;
    totalOrdersEl.textContent = dashboard.totalOrders;
    pendingOrdersEl.textContent = dashboard.pendingOrders;

    renderOrders(dashboard.recentOrders || []);
    renderInventory(inventory || []);

    fillSelect(orderClientIdEl, clients, 'Selecione o cliente');
    fillSelect(orderEquipmentIdEl, equipment, 'Selecione o equipamento');
  } catch (error) {
    console.error(error);
  }
}

async function submitClient(event) {
  event.preventDefault();

  const payload = {
    name: document.getElementById('clientName').value,
    phone: document.getElementById('clientPhone').value,
    email: document.getElementById('clientEmail').value
  };

  await fetchJson('/api/clients', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

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

  await fetchJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  event.target.reset();
  await loadDashboard();
}

document.getElementById('clientForm').addEventListener('submit', submitClient);
document.getElementById('orderForm').addEventListener('submit', submitOrder);

loadDashboard();
