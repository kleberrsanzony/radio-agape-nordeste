// ===== STARS BACKGROUND =====
function initStars() {
  const starsEl = document.getElementById('stars');
  if (!starsEl) return;
  
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      --d:${2+Math.random()*4}s; --delay:${Math.random()*4}s;
      --base-op:${0.1+Math.random()*0.5};
    `;
    starsEl.appendChild(s);
  }
}


// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(r => observer.observe(r));
}

// ===== INIT ALL =====
function initializeApp() {
  console.log('🎬 Inicializando aplicação...');
  initStars();
  initScrollReveal();
  window.refreshScrollReveal = initScrollReveal;
  console.log('✓ Aplicação inicializada com sucesso!');
}

// Aguarda os módulos carregarem antes de inicializar
window.addEventListener('modulesLoaded', initializeApp);

// Re-aplica animações após o carregamento dinâmico de dados
window.addEventListener('adminDataReady', () => {
  setTimeout(() => {
    if (window.refreshScrollReveal) window.refreshScrollReveal();
  }, 100);
});
