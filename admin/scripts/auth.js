// Lógica de Autenticação Supabase para o Admin

document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const errorDiv = document.getElementById('login-error');
    const emailDisplay = document.getElementById('user-email-display');

    // Inicialização da Sessão
    async function checkSession() {
        if (!window.supabaseClient) {
            showError("Supabase Client não inicializado. Verifique a internet e a chave.");
            return;
        }

        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        
        if (error) {
            console.error("Erro ao checar sessão", error);
            showLogin();
            return;
        }

        if (session && session.user) {
            // Verificar se o usuário existe na tabela admins (segurança extra)
            const { data: adminData, error: adminError } = await window.supabaseClient
                .from('admins')
                .select('id')
                .eq('id', session.user.id)
                .single();

            if (adminError || !adminData) {
                // Usuário está autenticado, mas NÃO É ADMIN. Fazer logout forçado.
                showError("Acesso Negado: Sua conta não tem permissão de Administrador.");
                await window.supabaseClient.auth.signOut();
                showLogin();
            } else {
                // Usuário válido e é Admin
                emailDisplay.textContent = session.user.email;
                showDashboard();
            }
        } else {
            showLogin();
        }

        // Listener para mudanças de estado (ex: sessão expirou)
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                showLogin();
            }
        });
    }

    // Ação de Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');
        
        btn.textContent = "Verificando...";
        btn.disabled = true;
        errorDiv.style.display = 'none';

        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            
            // A verificação de "is_admin" será feita pelo checkSession via recarregamento de estado
            checkSession();
        } catch (error) {
            showError("Falha no login: E-mail ou senha incorretos.");
        } finally {
            btn.textContent = "Entrar Seguramente";
            btn.disabled = false;
        }
    });

    // Ação de Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await window.supabaseClient.auth.signOut();
        });
    }

    // UI Helpers
    function showLogin() {
        loginView.style.display = 'flex';
        dashboardView.style.display = 'none';
    }

    function showDashboard() {
        loginView.style.display = 'none';
        dashboardView.style.display = 'flex';
        
        // Disparar um evento para o admin.js carregar os dados
        window.dispatchEvent(new CustomEvent('adminAuthenticated'));
    }

    function showError(msg) {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
    }

    // Iniciar
    checkSession();
});
