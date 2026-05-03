document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-config');

    window.addEventListener('adminAuthenticated', loadConfig);

    async function loadConfig() {
        if(!form) return;
        try {
            const { data, error } = await window.supabaseClient
                .from('site_config')
                .select('data')
                .eq('id', 'contact_config')
                .single();

            if (data && data.data) {
                const config = data.data;
                document.getElementById('config-email').value = config.email || '';
                document.getElementById('config-phone').value = config.phone || '';
                document.getElementById('config-instagram').value = config.instagram || '';
            }
        } catch (e) {
            console.error("Falha ao carregar Configuração de Contato", e);
        }
    }

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            btn.textContent = "Salvando...";
            btn.disabled = true;

            const payload = {
                email: document.getElementById('config-email').value,
                phone: document.getElementById('config-phone').value,
                instagram: document.getElementById('config-instagram').value
            };

            try {
                const { error } = await window.supabaseClient
                    .from('site_config')
                    .upsert({ id: 'contact_config', data: payload });

                if (error) throw error;
                
                // Dispara o toast genérico se existir
                const notifArea = document.getElementById('notification-area');
                if(notifArea) {
                    notifArea.innerHTML = `<div class="alert success">Contatos atualizados com sucesso!</div>`;
                    setTimeout(() => { notifArea.innerHTML = ''; }, 5000);
                }
            } catch (err) {
                console.error(err);
                alert("Erro ao salvar contatos.");
            } finally {
                btn.textContent = "Salvar Contatos";
                btn.disabled = false;
            }
        });
    }
});
