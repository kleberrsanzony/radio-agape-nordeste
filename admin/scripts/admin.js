// Admin Dashboard Controller

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // TABS MANAGEMENT
    // ==========================================
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const tabTitle = document.getElementById('current-tab-title');
    const notifArea = document.getElementById('notification-area');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Ativa o clicado
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Atualiza Titulo
            tabTitle.textContent = item.textContent.replace(/[^\w\s\u00C0-\u00FF]/g, '').trim();
            
            // Oculta notificações antigas
            notifArea.innerHTML = '';
        });
    });

    // ==========================================
    // NOTIFICATIONS
    // ==========================================
    function showNotification(msg, type = 'success') {
        notifArea.innerHTML = `<div class="alert ${type}">${msg}</div>`;
        setTimeout(() => {
            notifArea.innerHTML = '';
        }, 5000);
    }

    // ==========================================
    // DATA LOADING & SAVING (Exemplo: PLAYER)
    // ==========================================
    
    window.addEventListener('adminAuthenticated', async () => {
        // Carrega as configurações do Player assim que autenticar
        loadPlayerConfig();
        // Aqui chamaria também: loadSchedule(), loadNews(), etc.
    });

    // --- PLAYER CONFIG ---
    async function loadPlayerConfig() {
        try {
            const { data, error } = await window.supabaseClient
                .from('site_config')
                .select('data')
                .eq('id', 'player_config')
                .single();

            if (data && data.data) {
                const config = data.data;
                document.getElementById('player-title').value = config.playerTitle || '';
                document.getElementById('player-desc').value = config.playerDesc || '';
                document.getElementById('player-stream').value = config.streamUrl || '';
                document.getElementById('player-volume').checked = config.enableVolume !== false;
            }
        } catch (e) {
            console.error("Falha ao carregar Player Config", e);
        }
    }

    document.getElementById('form-player').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.textContent = "Salvando...";
        btn.disabled = true;

        const payload = {
            playerTitle: document.getElementById('player-title').value,
            playerDesc: document.getElementById('player-desc').value,
            streamUrl: document.getElementById('player-stream').value,
            enableVolume: document.getElementById('player-volume').checked
        };

        try {
            const { error } = await window.supabaseClient
                .from('site_config')
                .upsert({ id: 'player_config', data: payload });

            if (error) throw error;
            showNotification('Configurações da Rádio Web salvas com sucesso!');
        } catch (e) {
            console.error(e);
            showNotification('Erro ao salvar. Verifique suas permissões.', 'error');
        } finally {
            btn.textContent = "Salvar Configurações";
            btn.disabled = false;
        }
    });

    // ==========================================
    // UPLOAD HELPER (Storage)
    // ==========================================
    // Função genérica para usar nas outras abas (Músicas, Notícias, etc)
    window.uploadImage = async function(file, bucket) {
        if (!file) return null;
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await window.supabaseClient.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = window.supabaseClient.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    };
});
