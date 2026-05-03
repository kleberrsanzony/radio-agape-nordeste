document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-music');
    const listGrid = document.getElementById('music-list');

    window.addEventListener('adminAuthenticated', loadMusic);

    async function loadMusic() {
        if(!listGrid) return;
        try {
            const { data, error } = await window.supabaseClient
                .from('music')
                .select('*')
                .order('position', { ascending: true });
            
            if (error) throw error;

            listGrid.innerHTML = '';
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'card';
                div.style.padding = '10px';
                div.style.marginBottom = '10px';
                div.innerHTML = `
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div style="font-size:24px; font-weight:bold; color:var(--gold); width:30px;">#${item.position}</div>
                        <img src="${item.cover_url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                        <div style="flex: 1;">
                            <h4 style="margin-bottom:2px;">${item.title}</h4>
                            <small style="color:var(--text-muted)">${item.artist}</small>
                        </div>
                        <button class="btn-danger btn-delete" data-id="${item.id}">Excluir</button>
                    </div>
                `;
                listGrid.appendChild(div);
            });

            document.querySelectorAll('#music-list .btn-delete').forEach(btn => {
                btn.addEventListener('click', deleteMusic);
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
                const fileInput = document.getElementById('music-image');
                let imageUrl = '';

                if (fileInput.files.length > 0) {
                    imageUrl = await window.uploadImage(fileInput.files[0], 'covers');
                }

                const payload = {
                    position: parseInt(document.getElementById('music-position').value),
                    title: document.getElementById('music-title').value,
                    artist: document.getElementById('music-artist').value,
                    cover_url: imageUrl
                };

                const { error } = await window.supabaseClient.from('music').insert([payload]);
                if (error) throw error;
                
                form.reset();
                loadMusic();
            } catch (err) {
                console.error(err);
                alert("Erro ao adicionar música. Talvez a posição já exista ou arquivo grande demais.");
            } finally {
                btn.textContent = 'Adicionar Música';
                btn.disabled = false;
            }
        });
    }

    async function deleteMusic(e) {
        if (!confirm("Excluir música?")) return;
        const id = e.target.getAttribute('data-id');
        e.target.disabled = true;
        try {
            await window.supabaseClient.from('music').delete().eq('id', id);
            loadMusic();
        } catch (err) {
            console.error(err);
        }
    }
});
