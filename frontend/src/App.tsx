import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, Box, ClipboardList, Plus, RefreshCw, Users, Wrench } from 'lucide-react';
import { clearStoredCredentials, getJson, getStoredCredentials, login } from './api';

type Summary = { customers: number; equipment: number; serviceOrders: number };
type Customer = { id: number; name: string; phone?: string; email?: string };
type Order = { id: number; code: string; reportedIssue: string; status: string; estimatedValue: number };

export default function App() {
  const saved = useMemo(() => getStoredCredentials(), []);
  const [authenticated, setAuthenticated] = useState(Boolean(saved));
  const [username, setUsername] = useState(saved?.username ?? '');
  const [password, setPassword] = useState(saved?.password ?? '');
  const [role, setRole] = useState('');
  const [summary, setSummary] = useState<Summary>({ customers: 0, equipment: 0, serviceOrders: 0 });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [section, setSection] = useState('Visão geral');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setError('');
      const [summaryData, customersData, ordersData] = await Promise.all([
        getJson<Summary>('/dashboard'),
        getJson<Customer[]>('/customers'),
        getJson<Order[]>('/service-orders')
      ]);
      setSummary(summaryData);
      setCustomers(customersData);
      setOrders(ordersData);
    } catch (err) {
      setError('Não foi possível conectar com a API. Verifique backend e banco.');
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(username, password);
      setRole(result.role || 'ADMIN');
      setAuthenticated(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao fazer login');
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearStoredCredentials();
    setAuthenticated(false);
    setRole('');
    setPassword('');
    setError('');
  }

  useEffect(() => {
    if (authenticated) {
      void load();
    }
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <div className="brand-row">
            <span className="brand-icon">T</span>
            <div>
              <h1>TechFlow</h1>
              <p>Gestão técnica</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <label>
              Usuário
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required />
            </label>
            <label>
              Senha
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="SenhaForte!123" required />
            </label>
            <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          </form>

          {error && <div className="error-box">{error}</div>}

          <div className="helper-box">
            <strong>Credenciais padrão local:</strong>
            <br />
            Usuário: admin
            <br />
            Senha: SenhaForte!123
          </div>
        </div>
      </div>
    );
  }

  const nav = [
    { name: 'Visão geral', icon: Activity },
    { name: 'Ordens de serviço', icon: ClipboardList },
    { name: 'Clientes', icon: Users },
    { name: 'Equipamentos', icon: Wrench },
    { name: 'Estoque', icon: Box }
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand-row">
          <span className="brand-icon">T</span>
          <div>
            <b>TechFlow</b>
            <small>GESTÃO TÉCNICA</small>
          </div>
        </div>

        <p className="menu-label">MENU PRINCIPAL</p>
        {nav.map((item) => (
          <button key={item.name} className={`nav-item ${section === item.name ? 'active' : ''}`} onClick={() => setSection(item.name)}>
            <item.icon size={18} /> {item.name}
          </button>
        ))}

        <div className="side-bottom">
          <span className="online-dot" /> Sistema ativo
        </div>

        <button className="logout-btn" onClick={handleLogout}>Sair</button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">PAINEL DE CONTROLE</span>
            <h1>{section}</h1>
          </div>

          <div className="top-actions">
            <button className="icon-button" aria-label="Notificações"><Bell size={19} /></button>
            <div className="avatar">{username.slice(0, 2).toUpperCase() || 'TF'}</div>
            <span className="user-tag">{role || 'ADMIN'}</span>
          </div>
        </header>

        {error && <div className="error">{error}</div>}

        {section === 'Visão geral' ? (
          <>
            <div className="welcome">
              <div>
                <span className="eyebrow light">CENTRAL DE OPERAÇÕES</span>
                <h2>Bem-vindo ao TechFlow</h2>
                <p>Gerencie assistência técnica em um só lugar.</p>
              </div>
              <button className="primary" onClick={() => setSection('Ordens de serviço')}><Plus size={17} /> Nova ordem</button>
            </div>

            <div className="stats">
              <Stat title="Clientes cadastrados" value={summary.customers} icon={<Users />} />
              <Stat title="Equipamentos" value={summary.equipment} icon={<Wrench />} />
              <Stat title="Ordens de serviço" value={summary.serviceOrders} icon={<ClipboardList />} />
              <Stat title="Status da API" value={error ? 'Offline' : 'Conectada'} icon={<Activity />} />
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3>Ordens recentes</h3>
                  <p>Acompanhamento dos atendimentos</p>
                </div>
                <button className="secondary" onClick={() => void load()}><RefreshCw size={15} /> Atualizar</button>
              </div>
              <OrdersTable orders={orders.slice(0, 6)} />
            </div>
          </>
        ) : section === 'Clientes' ? (
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Clientes</h3>
                <p>Clientes cadastrados no sistema</p>
              </div>
              <span className="count">{customers.length} registros</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td>{customer.phone || '—'}</td>
                      <td>{customer.email || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!customers.length && <p className="empty">Nenhum cliente cadastrado.</p>}
            </div>
          </div>
        ) : section === 'Ordens de serviço' ? (
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Ordens de serviço</h3>
                <p>Controle de reparos e atendimentos</p>
              </div>
              <span className="count">{orders.length} registros</span>
            </div>
            <OrdersTable orders={orders} />
          </div>
        ) : (
          <div className="panel">
            <h3>{section}</h3>
            <p className="muted">Módulo em desenvolvimento no TechFlow.</p>
          </div>
        )}

        <footer>TECHFLOW <span>•</span> Plataforma de gestão para assistência técnica</footer>
      </main>
    </div>
  );
}

function Stat({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{title}</span>
        <i>{icon}</i>
      </div>
      <strong>{value}</strong>
      <small>Dados atuais do sistema</small>
    </div>
  );
}

function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Problema informado</th>
            <th>Status</th>
            <th>Valor estimado</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="code">{order.code}</td>
              <td>{order.reportedIssue}</td>
              <td><span className="status">{order.status.replaceAll('_', ' ')}</span></td>
              <td>{Number(order.estimatedValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!orders.length && <p className="empty">Nenhuma ordem cadastrada.</p>}
    </div>
  );
}
