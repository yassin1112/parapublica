const SESSION_KEY = 'parapublic_session';

function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSession(user, token) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
  if (token) sessionStorage.setItem('parapublic_token', token);
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('parapublic_token');
}

function getCurrentUser() {
  return getSession()?.user || null;
}

function isAdmin() {
  const u = getCurrentUser();
  return u && u.role === 'admin';
}

async function refreshCurrentUser() {
  if (!getToken()) return null;
  try {
    const { user } = await api('/auth/me');
    setSession(user, getToken());
    return user;
  } catch {
    clearSession();
    return null;
  }
}

function requireLogin() {
  if (!getCurrentUser()) {
    flash('error', t('flash_login_required'));
    window.location.href = pageUrl('login.html');
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!requireLogin()) return false;
  if (!isAdmin()) {
    flash('error', t('flash_admin_only'));
    window.location.href = pageUrl('index.html');
    return false;
  }
  return true;
}

function logout() {
  clearSession();
  flash('success', t('flash_logout'));
}

const FLASH_KEY = 'parapublic_flash';

function flash(type, message) {
  sessionStorage.setItem(FLASH_KEY, JSON.stringify({ type, message }));
}

function consumeFlash() {
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(FLASH_KEY);
  return JSON.parse(raw);
}

async function loginWithApi(email, password) {
  const { user, token } = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setSession(user, token);
  return user;
}

async function registerWithApi(name, email, password) {
  const { user, token } = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setSession(user, token);
  return user;
}

async function requestPasswordReset(email) {
  return api('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

async function resetPasswordWithToken(token, password) {
  return api('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}
