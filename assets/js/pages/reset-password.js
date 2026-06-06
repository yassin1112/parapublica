runPage(async () => {
  const token = getQueryParam('token');
  if (!token) {
    window.location.href = pageUrl('forgot-password.html');
    return;
  }

  mountLayout({
    title: t('reset_password'),
    activeNav: 'login',
    mainHtml: `
      <section class="auth-page container">
        <div class="card" data-animate>
          <h1>${t('reset_password')}</h1>
          <div id="form-error" class="alert alert-error" style="display:none"></div>
          <form id="reset-form">
            <div class="form-group">
              <label for="password">${t('new_password')}</label>
              <input type="password" id="password" name="password" required minlength="8">
            </div>
            <div class="form-group">
              <label for="password2">${t('password_hint')}</label>
              <input type="password" id="password2" name="password2" required minlength="8">
            </div>
            <button type="submit" class="btn btn-primary btn-auth btn-glow" style="width:100%">${t('btn_save')}</button>
          </form>
        </div>
      </section>`,
  });

  document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('form-error');
    err.style.display = 'none';
    const p1 = e.target.password.value;
    const p2 = e.target.password2.value;
    if (p1 !== p2) {
      err.textContent = t('password_mismatch');
      err.style.display = 'block';
      return;
    }
    try {
      await resetPasswordWithToken(token, p1);
      flash('success', t('password_reset_ok'));
      window.location.href = pageUrl('login.html');
    } catch (ex) {
      err.textContent = ex.message;
      err.style.display = 'block';
    }
  });
});
