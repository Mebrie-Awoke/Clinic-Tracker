const API_BASE = 'http://localhost:8000/api';
const state = {
  activeView: 'dashboard',
  dashboard: null,
  trends: null,
  logs: [],
  inventory: []
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function showMessage(message, type = 'info') {
  const alert = document.getElementById('message');
  alert.textContent = message;
  alert.className = `message ${type}`;
  alert.hidden = false;
}

function clearMessage() {
  const alert = document.getElementById('message');
  alert.hidden = true;
  alert.textContent = '';
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Request failed');
  }
  return data;
}

async function loadDashboard() {
  const [summary, trends] = await Promise.all([
    request('/dashboard/summary'),
    request('/dashboard/monthly-trends')
  ]);
  state.dashboard = summary;
  state.trends = trends;
}

async function loadDailyLogs() {
  state.logs = await request('/daily-logs');
}

async function loadInventory() {
  state.inventory = await request('/inventory');
}

function renderNav() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === state.activeView);
  });
  document.querySelectorAll('.view').forEach((section) => {
    section.classList.toggle('active', section.id === `${state.activeView}-view`);
  });
}

function renderDashboard() {
  const container = document.getElementById('dashboard-stats');
  if (!state.dashboard) {
    container.innerHTML = '<p>Loading dashboard...</p>';
    return;
  }

  const cards = [
    { label: 'Patients this month', value: state.dashboard.total_patients_month },
    { label: 'Revenue this month', value: formatCurrency(state.dashboard.total_revenue_month) },
    { label: 'Expenses this month', value: formatCurrency(state.dashboard.total_expenses_month) },
    { label: 'Profit this month', value: formatCurrency(state.dashboard.total_profit_month) }
  ];

  container.innerHTML = cards.map((card) => `
    <article class="card stat-card">
      <h3>${card.label}</h3>
      <p>${card.value}</p>
    </article>
  `).join('');

  const diseaseList = document.getElementById('top-diseases');
  diseaseList.innerHTML = (state.dashboard.top_diseases || []).map((disease) => `
    <li>${disease.disease} <span>${disease.count} cases</span></li>
  `).join('');

  const stockList = document.getElementById('critical-stock');
  stockList.innerHTML = (state.dashboard.critical_stock || []).map((item) => `
    <li>${item.drug} <span>${item.current_stock} in stock</span></li>
  `).join('');

  const trends = document.getElementById('monthly-trends');
  const months = state.trends?.months || [];
  const revenue = state.trends?.revenue || [];
  if (!months.length) {
    trends.innerHTML = '<p>No monthly trend data yet.</p>';
    return;
  }

  trends.innerHTML = months.map((month, index) => `
    <div class="trend-bar">
      <div class="bar-fill" style="height:${Math.max(18, (revenue[index] / Math.max(...revenue, 1)) * 100)}%"></div>
      <span>${month.slice(5)}</span>
    </div>
  `).join('');
}

function renderDailyLogs() {
  const list = document.getElementById('daily-log-list');
  if (!state.logs.length) {
    list.innerHTML = '<p>No daily logs yet. Add the first entry.</p>';
    return;
  }

  list.innerHTML = state.logs.map((log) => `
    <article class="card log-card">
      <div class="log-header">
        <strong>${log.date}</strong>
        <button class="danger" data-delete-log="${log.id}">Delete</button>
      </div>
      <p>Patients: ${log.total_patients} | Revenue: ${formatCurrency(log.total_revenue)} | Expenses: ${formatCurrency(log.total_expenses)}</p>
      <p>Profit: ${formatCurrency(log.profit)}</p>
      <p class="muted">${log.notes || 'No notes'}</p>
      <ul class="pill-list">
        ${(log.diseases || []).map((item) => `<li>${item.disease_name} × ${item.case_count}</li>`).join('')}
      </ul>
    </article>
  `).join('');
}

function renderInventory() {
  const list = document.getElementById('inventory-list');
  if (!state.inventory.length) {
    list.innerHTML = '<p>No inventory items yet.</p>';
    return;
  }

  list.innerHTML = state.inventory.map((item) => `
    <article class="card inventory-card">
      <div class="inventory-header">
        <strong>${item.drug_name}</strong>
        <span class="pill ${item.status.toLowerCase()}">${item.status}</span>
      </div>
      <p>Stock: ${item.quantity_in_stock} | Reorder: ${item.reorder_level}</p>
      <p>Unit cost: ${formatCurrency(item.unit_cost)} | Selling price: ${formatCurrency(item.selling_price)}</p>
      <div class="inventory-actions">
        <button class="secondary" data-stock-action="decrease" data-id="${item.id}">-</button>
        <button class="secondary" data-stock-action="increase" data-id="${item.id}">+</button>
        <button class="danger" data-delete-inventory="${item.id}">Delete</button>
      </div>
    </article>
  `).join('');
}

function renderReports() {
  const summary = document.getElementById('report-summary');
  if (!state.dashboard) {
    summary.innerHTML = '<p>Loading reports…</p>';
    return;
  }

  summary.innerHTML = `
    <div class="card">
      <h3>Overall performance</h3>
      <p>Total patients ever: ${state.dashboard.total_patients_all}</p>
      <p>Total revenue ever: ${formatCurrency(state.dashboard.total_revenue_all)}</p>
      <p>Average daily profit: ${formatCurrency(state.dashboard.avg_daily_profit)}</p>
    </div>
  `;
}

function render() {
  renderNav();
  renderDashboard();
  renderDailyLogs();
  renderInventory();
  renderReports();
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeView = button.dataset.view;
      render();
    });
  });

  document.getElementById('daily-log-form').addEventListener('submit', handleDailyLogSubmit);
  document.getElementById('inventory-form').addEventListener('submit', handleInventorySubmit);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  document.addEventListener('click', async (event) => {
    const deleteLogBtn = event.target.closest('[data-delete-log]');
    if (deleteLogBtn) {
      await deleteDailyLog(deleteLogBtn.dataset.deleteLog);
      return;
    }
    const deleteInventoryBtn = event.target.closest('[data-delete-inventory]');
    if (deleteInventoryBtn) {
      await deleteInventory(deleteInventoryBtn.dataset.deleteInventory);
      return;
    }
    const stockAction = event.target.closest('[data-stock-action]');
    if (stockAction) {
      await adjustInventory(stockAction.dataset.id, stockAction.dataset.stockAction === 'increase' ? 1 : -1);
    }
  });
}

async function handleDailyLogSubmit(event) {
  event.preventDefault();
  clearMessage();
  const form = event.currentTarget;
  const payload = {
    date: form.date.value,
    total_patients: Number(form.total_patients.value),
    total_revenue: Number(form.total_revenue.value),
    total_expenses: Number(form.total_expenses.value),
    notes: form.notes.value,
    diseases: parseDiseases(form.diseases.value)
  };

  try {
    await request('/daily-logs', { method: 'POST', body: JSON.stringify(payload) });
    form.reset();
    showMessage('Daily log saved successfully.', 'success');
    await loadData();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function handleInventorySubmit(event) {
  event.preventDefault();
  clearMessage();
  const form = event.currentTarget;
  const payload = {
    drug_name: form.drug_name.value,
    quantity_in_stock: Number(form.quantity_in_stock.value),
    reorder_level: Number(form.reorder_level.value),
    unit_cost: Number(form.unit_cost.value),
    selling_price: Number(form.selling_price.value),
    expiry_date: form.expiry_date.value || null
  };

  try {
    await request('/inventory', { method: 'POST', body: JSON.stringify(payload) });
    form.reset();
    showMessage('Inventory item saved.', 'success');
    await loadData();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function parseDiseases(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, count] = line.split(':');
      return { disease_name: name.trim(), case_count: Number(count || 1) };
    });
}

async function deleteDailyLog(id) {
  try {
    await request(`/daily-logs/${id}`, { method: 'DELETE' });
    showMessage('Log removed.', 'success');
    await loadData();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function deleteInventory(id) {
  try {
    await request(`/inventory/${id}`, { method: 'DELETE' });
    showMessage('Inventory item removed.', 'success');
    await loadData();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function adjustInventory(id, delta) {
  try {
    await request(`/inventory/${id}?quantity_delta=${delta}`, { method: 'PUT' });
    showMessage('Stock updated.', 'success');
    await loadData();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function loadData() {
  try {
    await Promise.all([loadDashboard(), loadDailyLogs(), loadInventory()]);
    render();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const button = document.getElementById('theme-toggle');
  button.textContent = document.body.classList.contains('dark') ? '☀️ Light mode' : '🌙 Dark mode';
}

bindEvents();
loadData();
