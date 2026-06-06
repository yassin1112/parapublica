runPage(() => {
  mountLayout({
    title: t('nav_about'),
    activeNav: 'about',
    mainHtml: `
      <section class="about-hero container" data-animate>
        <h1>${t('about_title')}</h1>
        <p style="max-width:640px;margin:1rem auto 0;color:var(--text-muted);font-size:1.1rem">${t('about_sub')}</p>
      </section>
      <section class="section container">
        <div class="about-grid">
          <div class="about-card" data-animate><div class="icon">✓</div><h3>Quality</h3><p>Certified suppliers & expiry tracking.</p></div>
          <div class="about-card" data-animate><div class="icon">📦</div><h3>Stock</h3><p>Real-time inventory & low-stock alerts.</p></div>
          <div class="about-card" data-animate><div class="icon">👤</div><h3>Accounts</h3><p>Secure login & personal dashboard.</p></div>
          <div class="about-card" data-animate><div class="icon">💬</div><h3>Support</h3><p>Friendly team ready to help.</p></div>
        </div>
      </section>
      <section class="section container" data-animate>
        <div class="card" style="max-width:720px;margin:0 auto;text-align:center">
          <p class="delivery-note">${escapeHtml(t('delivery_note'))}</p>
          <a href="${pageUrl('products.html')}" class="btn btn-primary" style="margin-top:1.5rem">${t('hero_cta_products')}</a>
        </div>
      </section>`,
  });
});
