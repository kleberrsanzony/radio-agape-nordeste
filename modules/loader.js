/**
 * Module Loader - Carrega componentes HTML dinamicamente
 * Padrão Micro Frontend
 */

const MODULES = {
  stars: './modules/components/stars.html',
  navbar: './modules/components/navbar.html',
  hero: './modules/components/hero.html',
  schedule: './modules/components/schedule.html',
  music: './modules/components/music.html',
  programs: './modules/components/programs.html',
  news: './modules/components/news.html',
  ads: './modules/components/ads.html',
  about: './modules/components/about.html',
  contact: './modules/components/contact.html',
  player: './modules/components/player.html',
  footer: './modules/components/footer.html'
};

const CONTAINERS = {
  stars: 'stars-container',
  navbar: 'navbar-container',
  hero: 'hero-container',
  schedule: 'schedule-container',
  music: 'music-container',
  programs: 'programs-container',
  news: 'news-container',
  ads: 'ads-container',
  about: 'about-container',
  contact: 'contact-container',
  player: 'player-container',
  footer: 'footer-container'
};

/**
 * Carrega um módulo HTML e injeta no container
 * @param {string} moduleName - Nome do módulo
 * @returns {Promise}
 */
async function loadModule(moduleName) {
  try {
    const modulePath = MODULES[moduleName];
    const containerId = CONTAINERS[moduleName];
    
    if (!modulePath || !containerId) {
      console.warn(`Módulo ${moduleName} não configurado`);
      return;
    }

    const response = await fetch(modulePath);
    if (!response.ok) {
      throw new Error(`Falha ao carregar ${modulePath}: ${response.status}`);
    }

    const html = await response.text();
    const container = document.getElementById(containerId);
    
    if (container) {
      container.innerHTML = html;
      
      // O navegador não executa tags <script> inseridas via innerHTML.
      // Precisamos recriar e re-inserir os scripts manualmente para que funcionem.
      const scripts = container.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      console.log(`✓ Módulo carregado: ${moduleName}`);
    }
  } catch (error) {
    console.error(`Erro ao carregar módulo ${moduleName}:`, error);
  }
}

/**
 * Carrega todos os módulos em sequência
 * @returns {Promise}
 */
async function loadAllModules() {
  const moduleNames = Object.keys(MODULES);
  
  console.log(`Carregando ${moduleNames.length} módulos...`);
  
  for (const moduleName of moduleNames) {
    await loadModule(moduleName);
  }
  
  console.log('✓ Todos os módulos carregados com sucesso!');
  
  // Dispara evento customizado para indicar que o carregamento terminou
  window.dispatchEvent(new CustomEvent('modulesLoaded'));
}

// Inicia o carregamento quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllModules);
} else {
  // DOM já está pronto
  loadAllModules();
}
