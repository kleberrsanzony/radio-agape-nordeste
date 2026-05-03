# 👨‍💻 Guia do Desenvolvedor (Integração Supabase)

O projeto baseava-se em `localStorage`, mas foi promovido a um ambiente **Cloud-Native** robusto, utilizando **Supabase**.

## 🛠 Arquitetura do Sistema

1.  **Frontend Público:** HTML, CSS (Vanilla) e JavaScript limpo. Organizado em componentes na pasta `modules/components/`.
2.  **Painel Administrativo:** Localizado na pasta `/admin`. Controla a inserção, edição e remoção de dados. Protegido por Supabase Auth.
3.  **Backend & Banco de Dados:** PostgreSQL hospedado no Supabase. O arquivo `supabase_setup.sql` contém a estrutura do banco.
4.  **Integração (Client):** `assets/scripts/supabase-client.js` inicializa o cliente e puxa as tabelas necessárias quando o site é carregado.

## 📦 Como os Componentes Funcionam

O painel `/admin` salva os dados diretamente nas tabelas (`news`, `programs`, `schedule`, `music`, `site_config`).
Quando o usuário abre o `index.html` público:
1.  `supabase-client.js` é inicializado e faz o fetch das tabelas no banco de dados.
2.  Os dados são parseados, mapeados (ex: `image_url` vira `image`) e guardados temporariamente na variável `window._SUPABASE_CACHE`.
3.  Um evento chamado `adminDataReady` é disparado globalmente (`window.dispatchEvent(new CustomEvent('adminDataReady'))`).
4.  Os scripts de cada componente (ex: `news.html`) escutam este evento, rodam a função `ADMIN_DATA.load('news_config')` (agora um wrapper pro cache), e atualizam o DOM.

## 🔧 Como Adicionar um Novo Módulo

Se você quiser criar uma nova seção no site e no admin:

### 1. Banco de Dados (Supabase)
Vá no painel do Supabase e crie a tabela desejada (Ex: `team`).
Habilite o RLS (Row Level Security) e defina as políticas de acesso usando o modelo já existente: Leitura pública, Escrita para admins.

### 2. Frontend Público
1. Crie o arquivo `modules/components/team.html`
2. Adicione no `modules/loader.js`
3. Crie a lógica em JS dentro do `team.html` escutando o evento `adminDataReady` e puxando os dados de `team_config`.

### 3. Integração Supabase Client
No arquivo `assets/scripts/supabase-client.js`:
Adicione a tabela na chamada do `Promise.all`:
```javascript
fetchTable('team', 'team_config', 'members')
```

### 4. Admin
1. Adicione a aba correspondente no `admin/index.html`.
2. Crie o script `admin/modules/team.js`. Use a variável global `window.supabaseClient` (já autenticada) para fazer `insert` e `delete`.
3. Adicione a tag do script no final do `index.html` do Admin.

## 🖼 Imagens e Storage

Todos os uploads são feitos em Storage Buckets configurados.
Temos um helper de upload em `admin/scripts/admin.js` acessível em `window.uploadImage(file, bucket)`.
Ao enviar o arquivo, o link final gerado é injetado diretamente como string na tabela PostgreSQL correspondente, facilitando a renderização rápida no frontend.
