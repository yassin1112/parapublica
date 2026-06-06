runPage(async () => {
  mountLayout({
    title: t('forgot_password'),
    activeNav: 'login',
    mainHtml: `
      <section class="auth-page container">
        <div class="card" data-animate>
          <h1>${t('forgot_password')}</h1>
          <p style="color:var(--text-muted);margin-bottom:1.25rem">${t('email')}</p>
          <div id="form-error" class="alert alert-error" style="display:none"></div>
          <div id="reset-result" style="display:none" class="alert alert-success"></div>
          <form id="forgot-form">
            <div class="form-group">
              <label for="email">${t('email')}</label>
              <input type="email" id="email" name="email" required>
            </div>
            <button type="submit" class="btn btn-primary btn-auth btn-glow" style="width:100%">${t('send_reset_link')}</button>
          </form>
          <p style="margin-top:1.25rem;text-align:center">
            <a href="${pageUrl('login.html')}">${t('nav_login')}</a>
          </p>
        </div>
      </section>`,
  });

  document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('form-error');
    const res = document.getElementById('reset-result');
    err.style.display = 'none';
    res.style.display = 'none';
    try {
      const data = await requestPasswordReset(e.target.email.value.trim());
      res.innerHTML = `<p>${escapeHtml(t('reset_link_sent'))}</p>`;
      if (data.resetUrl) {
        res.innerHTML += `<p style="margin-top:.75rem"><a href="${escapeHtml(data.resetUrl)}" class="btn btn-sm btn-outline">${t('reset_password')}</a></p>`;
      }
      res.style.display = 'block';
      e.target.style.display = 'none';
    } catch (ex) {
      err.textContent = ex.message;
      err.style.display = 'block';
    }
  });
});
