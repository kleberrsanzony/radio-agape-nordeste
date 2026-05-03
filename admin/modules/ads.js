document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-ads');
    const listGrid = document.getElementById('ads-list');

    window.addEventListener('adminAuthenticated', loadAds);

    async function loadAds() {
        if(!listGrid) return;
        try {
            const { data, error } = await window.supabaseClient
                .from('ads')
                .select('*')
                .order('created_at', { ascending: true });
            
            if (error) throw error;

            listGrid.innerHTML = '';
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'card';
                div.style.padding = '10px';
                div.style.marginBottom = '10px';
                
                div.innerHTML = `
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div style="font-size:24px;">💰</div>
                        <div style="flex: 1;">
                            <h4 style="margin-bottom:2px;">
                                ${item.title} 
                                ${item.is_popular ? '<span style="font-size:10px; background:var(--gold); color:black; padding:2px 5px; border-radius:4px; margin-left:5px;">Destaque</span>' : ''}
                            </h4>
                            <small style="color:var(--text-muted)">${item.price}</small>
                        </div>
                        <button class="btn-danger btn-delete" data-id="${item.id}">Excluir</button>
                    </div>
                `;
                listGrid.appendChild(div);
            });

            document.querySelectorAll('#ads-list .btn-delete').forEach(btn => {
                btn.addEventListener('click', deleteAd);
            });
        } catch (e) {
            console.error(e);
        }
    }

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            btn.textContent = 'Enviando...';
            btn.disabled = true;

            try {
                const payload = {
                    title: document.getElementById('ads-title').value,
                    price: document.getElementById('ads-price').value,
                    is_popular: document.getElementById('ads-popular').checked
                };

                const { error } = await window.supabaseClient.from('ads').insert([payload]);
                if (error) throw error;
                
                form.reset();
                loadAds();
            } catch (err) {
                console.error(err);
                alert("Erro ao adicionar plano de anúncio.");
            } finally {
                btn.textContent = 'Adicionar Plano';
                btn.disabled = false;
            }
        });
    }

    async function deleteAd(e) {
        if (!confirm("Excluir plano de anúncio?")) return;
        const id = e.target.getAttribute('data-id');
        e.target.disabled = true;
        try {
            await window.supabaseClient.from('ads').delete().eq('id', id);
            loadAds();
        } catch (err) {
            console.error(err);
        }
    }
});
