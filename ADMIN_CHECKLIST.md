# ✅ CHECKLIST DO PAINEL ADMINISTRATIVO (PRODUÇÃO)

## 🎯 Primeiro Passo - Acesso Inicial

### ✅ Passo 1: Abrir o Admin
- [ ] Acesse `admin/index.html` (ou o domínio do painel caso publicado)

### ✅ Passo 2: Fazer Login (Supabase Auth)
- [ ] Utilize o e-mail e senha que você cadastrou previamente no painel do Supabase.
- [ ] O acesso só será concedido se o seu UUID (do Supabase Auth) estiver listado na tabela `public.admins`.

### ✅ Passo 3: Cadastrar Novos Administradores (Se necessário)
- [ ] Acesse o painel da sua conta no [Supabase](https://supabase.com).
- [ ] Vá em **Authentication -> Users** e clique em **Add User**.
- [ ] Após criar o usuário, copie o **User UID**.
- [ ] Vá no **Table Editor -> admins** e adicione uma nova linha com o UID copiado e o e-mail da pessoa.

---

## 📅 Preenchimento de Conteúdo

### ✅ Módulos de Configuração Geral
- [ ] **⚙️ Config. Geral** - Preencha seu E-mail de contato, Telefone/WhatsApp e conta do Instagram. (Isto atualizará o rodapé e a página de contatos do site).
- [ ] **▶️ Player (Rádio Web)** - Adicione a URL do seu stream de áudio, Título e Locutor atual.

### ✅ Módulos de Atualização Frequente
- [ ] **📰 Notícias** - Adicione notícias com imagem de capa (As imagens são enviadas automaticamente para o bucket `news` no Supabase Storage).
- [ ] **📅 Programação** - Adicione os programas diários na grade especificando horário, nome e apresentador.
- [ ] **🎵 Top Músicas** - Selecione a posição de 1 a 6 e envie a capa.
- [ ] **📻 Programas (Cards)** - Adicione os banners grandes que ficam na Home.
- [ ] **💼 Anúncios** - Crie e gerencie os planos comerciais.

---

## 🔐 Dicas de Segurança e Boas Práticas

- [ ] **Imagens:** O sistema faz upload direto para o Storage do Supabase. Sempre tente enviar imagens compactadas (JPG ou WebP) para economizar banda do seu plano no Supabase.
- [ ] **Fallback:** Se a internet falhar ou o limite do Supabase for atingido momentaneamente, o site mostrará informações padrão seguras (graças ao sistema de "Fallback" do código) em vez de uma tela quebrada.
- [ ] **Chave Pública (Anon Key):** O painel e o site usam a Anon Key. Isso é **totalmente seguro**, pois toda a proteção do banco de dados e arquivos é garantida pelo Row Level Security (RLS). Ninguém sem login de admin consegue alterar ou apagar dados.
