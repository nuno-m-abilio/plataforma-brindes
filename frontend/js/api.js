import { getToken, getRole, clearSession } from './session.js';

// Uso: const dados = await api('/rewards');
//      await api('/redemptions', { method: 'POST', body: { rewardId: 1 } });
//      await api('/admin/points/import', { method: 'POST', formData });
export async function api(path, { method = 'GET', body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (formData) {
    payload = formData;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(`/api${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Sessão expirada: volta para o login
    if (res.status === 401 && token) {
      const role = getRole();
      clearSession();
      location.href = role === 'ADMIN' ? '/admin/login.html' : '/index.html';
    }
    throw new Error(data?.error?.message || 'Erro inesperado');
  }
  return data;
}
