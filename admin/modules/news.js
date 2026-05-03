document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-news');
    const listGrid = document.getElementById('news-list');

    window.addEventListener('adminAuthenticated', loadNews);

    async function loadNews() {
        if(!listGrid) return;
        try {
            const { data, error } = await window.supabaseClient
                .from('news')
                .select('*')
                .order('published_at', { ascending: false });
            
            if (error) throw error;

            listGrid.innerHTML = '';
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'card';
                div.style.padding = '10px';
                div.style.marginBottom = '10px';
                div.innerHTML = `
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <img src="${item.image_url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                        <div style="flex: 1;">
                            <h4 style="margin-bottom:5px;">${item.title}</h4>
                            <small>${item.category} | ${item.author}</small>
                        </div>
                        <button class="btn-danger btn-delete" data-id="${item.id}">Excluir</button>
                    </div>
                `;
                listGrid.appendChild(div);
            });

            document.querySelectorAll('#news-list .btn-delete').forEach(btn => {
                btn.addEventListener('click', deleteNews);
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
                const fileInput = document.getElementById('news-image');
                let imageUrl = '';

                if (fileInput.files.length > 0) {
                    imageUrl = await window.uploadImage(fileInput.files[0], 'news');
                }

                const payload = {
                    title: document.getElementById('news-title').value,
                    content: document.getElementById('news-content').value,
                    category: document.getElementById('news-category').value,
                    author: document.getElementById('news-author').value,
                    image_url: imageUrl
                };

                const { error } = await window.supabaseClient.from('news').insert([payload]);
                if (error) throw error;
                
                form.reset();
                loadNews();
            } catch (err) {
                console.error(err);
                alert("Erro ao publicar notícia. Verifique tamanho da imagem e permissões.");
            } finally {
                btn.textContent = 'Publicar Notícia';
                btn.disabled = false;
            }
        });
    }

    async function deleteNews(e) {
        if (!confirm("Excluir esta notícia?")) return;
        const id = e.target.getAttribute('data-id');
        e.target.disabled = true;
        try {
            await window.supabaseClient.from('news').delete().eq('id', id);
            loadNews();
        } catch (err) {
            console.error(err);
        }
    }
});
