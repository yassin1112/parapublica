runPage(async () => {
  const user = getCurrentUser();
  if (user) {
    window.location.href = user.role === 'admin' ? 'admin/index.html' : pageUrl('account.html');
    return;
  }

  mountLayout({
    title: t('login_title'),
    activeNav: 'login',
    mainHtml: `
      <section class="auth-page container">
        <div class="card" data-animate>
          <h1>${t('login_title')}</h1>
          <p style="color:var(--text-muted);margin-bottom:1.5rem">${t('login_sub')}</p>
          <div id="form-error" class="alert alert-error" style="display:none"></div>
          <form id="login-form">
            <div class="form-group">
              <label for="email">${t('email')}</label>
              <input type="email" id="email" name="email" required>
            </div>
          <div class="form-group">
            <label for="password">${t('password')}</label>
            <input type="password" id="password" name="password" required>
            <p style="margin-top:.5rem;font-size:.85rem"><a href="${pageUrl('forgot-password.html')}">${t('forgot_password')}</a></p>
          </div>
            <button type="submit" class="btn btn-primary btn-auth" style="width:100%">${t('nav_login')}</button>
          </form>
          <p style="margin-top:1.25rem;text-align:center;font-size:.9rem">
            ${t('no_account')} <a href="${pageUrl('register.html')}" class="btn btn-sm btn-outline" style="display:inline-flex;margin-top:.5rem">${t('nav_register')}</a>
          </p>
        </div>
      </section>`,
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('form-error');
    err.style.display = 'none';
    try {
      const u = await loginWithApi(e.target.email.value.trim(), e.target.password.value);
      flash('success', t('flash_welcome'));
      window.location.href = u.role === 'admin' ? 'admin/index.html' : pageUrl('account.html');
    } catch {
      err.textContent = t('err_login');
      err.style.display = 'block';
    }
  });
});
