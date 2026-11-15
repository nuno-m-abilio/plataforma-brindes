// Guarda token e perfil na sessionStorage (some ao fechar a aba).
export function saveSession({ token, role }) {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('role', role);
}
export const getToken = () => sessionStorage.getItem('token');
export const getRole = () => sessionStorage.getItem('role');
export const clearSession = () => sessionStorage.clear();

// Chame no topo das páginas protegidas: requireAuth('CUSTOMER') ou requireAuth('ADMIN')
export function requireAuth(role) {
  if (!getToken() || getRole() !== role) {
    location.href = role === 'ADMIN' ? '/admin/login.html' : '/index.html';
  }
}

export function logout() {
  const role = getRole();
  clearSession();
  location.href = role === 'ADMIN' ? '/admin/login.html' : '/index.html';
}
