runPage(async () => {
  if (getCurrentUser()) {
    window.location.href = pageUrl('account.html');
    return;
  }

  mountLayout({
    title: t('register_title'),
    activeNav: '',
    mainHtml: `
      <section class="auth-page container">
        <div class="card" data-animate>
          <h1>${t('register_title')}</h1>
          <p style="color:var(--text-muted);margin-bottom:1.5rem">${t('register_sub')}</p>
          <div id="form-error" class="alert alert-error" style="display:none"></div>
          <form id="register-form">
            <div class="form-group">
              <label for="name">${t('name')}</label>
              <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
              <label for="email">${t('email')}</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">${t('password_hint')}</label>
              <input type="password" id="password" name="password" required minlength="8">
            </div>
            <button type="submit" class="btn btn-primary btn-auth" style="width:100%">${t('nav_register')}</button>
          </form>
          <p style="margin-top:1.25rem;text-align:center;font-size:.9rem">
            ${t('have_account')} <a href="${pageUrl('login.html')}">${t('nav_login')}</a>
          </p>
        </div>
      </section>`,
  });

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('form-error');
    err.style.display = 'none';
    try {
      await registerWithApi(
        e.target.name.value.trim(),
        e.target.email.value.trim(),
        e.target.password.value
      );
      flash('success', t('flash_register_ok'));
      window.location.href = pageUrl('account.html');
    } catch (ex) {
      err.textContent = ex.message;
      err.style.display = 'block';
    }
  });
});
