export const onlyDigits = (value) => String(value).replace(/\D/g, '');

// 5544999990001 -> +55 (44) 99999-0001
export function formatPhone(value) {
  const d = onlyDigits(value);
  if (d.length !== 13) return value;
  return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
}

export const formatDate = (iso) => new Date(iso).toLocaleString('pt-BR');

export function showToast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message; // textContent: nunca injete HTML vindo do servidor
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
