document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-programs');
    const listGrid = document.getElementById('programs-list');

    window.addEventListener('adminAuthenticated', loadPrograms);

    async function loadPrograms() {
        if(!listGrid) return;
        try {
            const { data, error } = await window.supabaseClient
                .from('programs')
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
                        <img src="${item.image_url}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
                        <div style="flex: 1;">
                            <h4 style="margin-bottom:5px;">${item.title}</h4>
                            <small style="color:var(--gold)">${item.schedule_text}</small>
                            <p style="font-size:12px; margin-top:5px; color:var(--text-muted)">${item.description}</p>
                        </div>
                        <button class="btn-danger btn-delete" data-id="${item.id}">Excluir</button>
                    </div>
                `;
                listGrid.appendChild(div);
            });

            document.querySelectorAll('#programs-list .btn-delete').forEach(btn => {
                btn.addEventListener('click', deleteProgram);
            });
        } catch (e) {
            console.error(e);
        }
    }

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            btn.textContent = 'Adicionando...';
            btn.disabled = true;

            try {
                const fileInput = document.getElementById('prog-image');
                let imageUrl = '';

                if (fileInput.files.length > 0) {
                    imageUrl = await window.uploadImage(fileInput.files[0], 'hosts');
                }

                const payload = {
                    title: document.getElementById('prog-title').value,
                    schedule_text: document.getElementById('prog-schedule').value,
                    description: document.getElementById('prog-desc').value,
                    image_url: imageUrl
                };

                const { error } = await window.supabaseClient.from('programs').insert([payload]);
                if (error) throw error;
                
                form.reset();
                loadPrograms();
            } catch (err) {
                console.error(err);
                alert("Erro ao adicionar programa.");
            } finally {
                btn.textContent = 'Adicionar Programa';
                btn.disabled = false;
            }
        });
    }

    async function deleteProgram(e) {
        if (!confirm("Excluir este programa?")) return;
        const id = e.target.getAttribute('data-id');
        e.target.disabled = true;
        try {
            await window.supabaseClient.from('programs').delete().eq('id', id);
            loadPrograms();
        } catch (err) {
            console.error(err);
        }
    }
});
