// Supabase Configuração e Instância (Produção)
// Usa a chave PUBLICA (Anon Key), portanto é seguro expor no frontend.
// As regras de segurança são garantidas pelo RLS no banco de dados.

const SUPABASE_URL = 'https://jzjysbidbcjmjdwhddwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6ps0F3rRM2DMajkkyONXfQ_iVzd9QAA';

// Inicializar cliente Supabase (requer a biblioteca supabase-js carregada via CDN no index.html)
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fallbacks hardcoded caso o banco caia
window.RADIO_FALLBACKS = {
  player: {
    playerTitle: "Rádio Ágape Nordeste",
    playerDesc: "Ao Vivo - Sintonize com a Graça",
    streamUrl: "https://stream.radioagape.com/live",
    enableVolume: true
  },
  contact: {
    email: "contato@radioagape.com",
    phone: "(00) 00000-0000",
    instagram: "@radioagape"
  },
  schedule: [
    { day_of_week: 0, start_time: '07:00:00', duration_minutes: 120, program_name: 'Manhã com Deus', presenter: 'Pr. João Silva' }
  ]
};

// Inicialização dos Dados em Memória para manter compatibilidade com componentes síncronos
window._SUPABASE_CACHE = {};

// Objeto Global legado que os componentes usam
window.ADMIN_DATA = {
  load: function(key, fallbackData = null) {
    return window._SUPABASE_CACHE[key] !== undefined ? window._SUPABASE_CACHE[key] : fallbackData;
  }
};

// Objeto da API
window.API_DATA = {
  async init() {
    console.log('📡 Conectando ao Supabase para carregar configurações...');
    try {
      const { data, error } = await window.supabaseClient.from('site_config').select('*');
      if (error) throw error;
      
      // Salva site_config no cache
      if (data) {
        data.forEach(item => {
          window._SUPABASE_CACHE[item.id] = item.data;
        });
      }

      // Buscar tabelas (ex: programas, grade, top musicas)
      const fetchTable = async (tableName, cacheKey, dataKey, orderCol = 'created_at') => {
        let { data } = await window.supabaseClient.from(tableName).select('*').order(orderCol);
        
        if (data) {
          // Normalização de dados para compatibilidade com componentes legados
          const mappedData = data.map(item => {
            const newItem = { ...item };
            
            // Mapeamento Schedule
            if (tableName === 'schedule') {
              newItem.day = item.day_of_week;
              newItem.time = item.start_time ? item.start_time.substring(0, 5) : '';
              newItem.name = item.program_name;
              newItem.duration = item.duration_minutes;
            }
            
            // Mapeamento News
            if (tableName === 'news' && item) {
              newItem.image = item.image_url || '';
              newItem.featured = item.featured || false;
              newItem.date = item.published_at ? new Date(item.published_at).toLocaleDateString('pt-BR') : 'Recente';
            }
            
            // Mapeamento Music
            if (tableName === 'music') {
              newItem.cover = item.cover_url;
            }
            
            // Mapeamento Programs
            if (tableName === 'programs') {
              newItem.name = item.title;
              newItem.image = item.image_url;
            }
            
            return newItem;
          });

          window._SUPABASE_CACHE[cacheKey] = { [dataKey]: mappedData };
          console.log(`📦 Tabela [${tableName}] carregada: ${mappedData.length} itens.`);
        }
      };

      await Promise.all([
        fetchTable('schedule', 'schedule_config', 'programs', 'start_time'),
        fetchTable('music', 'music_config', 'musics', 'position'),
        fetchTable('programs', 'programs_config', 'programs'),
        fetchTable('news', 'news_config', 'news', 'published_at'),
        fetchTable('ads', 'ads_config', 'plans', 'price')
      ]);

      console.log('✅ Dados carregados do Supabase com sucesso.');
    } catch (error) {
      console.warn('⚠️ Falha ao carregar do Supabase. Usando Fallbacks locais.', error);
      // Fallback in case the DB is down or unreachable
      window._SUPABASE_CACHE['player_config'] = window.RADIO_FALLBACKS.player;
      window._SUPABASE_CACHE['contact_config'] = window.RADIO_FALLBACKS.contact;
      window._SUPABASE_CACHE['schedule_config'] = { programs: window.RADIO_FALLBACKS.schedule };
    } finally {
      // Dispara evento indicando que os dados estão prontos
      window.dispatchEvent(new CustomEvent('adminDataReady'));
    }
  }
};

// Iniciar a busca quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  window.API_DATA.init();
});
