document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-schedule');
    const tbody = document.querySelector('#schedule-table tbody');

    // Mapeamento de dias
    const daysStr = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    window.addEventListener('adminAuthenticated', loadSchedule);

    async function loadSchedule() {
        if(!tbody) return;
        try {
            const { data, error } = await window.supabaseClient
                .from('schedule')
                .select('*')
                .order('day_of_week')
                .order('start_time');
            
            if (error) throw error;

            tbody.innerHTML = '';
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${daysStr[item.day_of_week]}</td>
                    <td>${item.start_time.substring(0,5)}</td>
                    <td>${item.program_name}</td>
                    <td>${item.presenter}</td>
                    <td>
                        <button class="btn-danger btn-delete" data-id="${item.id}">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Bind Delete events
            document.querySelectorAll('#schedule-table .btn-delete').forEach(btn => {
                btn.addEventListener('click', deleteSchedule);
            });
        } catch (e) {
            console.error("Erro ao carregar grade", e);
        }
    }

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            btn.disabled = true;

            const payload = {
                day_of_week: parseInt(document.getElementById('sch-day').value),
                start_time: document.getElementById('sch-time').value + ':00',
                program_name: document.getElementById('sch-name').value,
                presenter: document.getElementById('sch-presenter').value,
                duration_minutes: parseInt(document.getElementById('sch-duration').value)
            };

            try {
                const { error } = await window.supabaseClient.from('schedule').insert([payload]);
                if (error) throw error;
                form.reset();
                loadSchedule();
            } catch (e) {
                console.error(e);
                alert("Erro ao adicionar na grade.");
            } finally {
                btn.disabled = false;
            }
        });
    }

    async function deleteSchedule(e) {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        
        const id = e.target.getAttribute('data-id');
        e.target.disabled = true;

        try {
            const { error } = await window.supabaseClient.from('schedule').delete().eq('id', id);
            if (error) throw error;
            loadSchedule();
        } catch (err) {
            console.error(err);
            alert("Erro ao excluir.");
            e.target.disabled = false;
        }
    }
});
