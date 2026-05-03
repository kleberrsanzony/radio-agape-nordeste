# 📻 Rádio Ágape Nordeste - Portal Completo

Um portal de rádio 100% gerenciável, moderno e com recursos essenciais para transmissão ao vivo. Construído com foco em alta performance e escalabilidade.

## ✨ Características do Projeto

*   **Design Premium (Dark Mode):** Visual sofisticado, animações suaves e tipografia elegante.
*   **Gestão de Conteúdo (CMS):** Painel administrativo integrado na rota `/admin`.
*   **Arquitetura em Nuvem (Supabase):** PostgreSQL para Banco de Dados, Storage para uploads de imagem, e Auth para proteção das páginas do admin. Tudo hospedado online e sincronizado.
*   **Resiliência (Fallback):** Sistema de cache para garantir que a rádio nunca fique offline caso a internet do visitante oscile ao buscar dados do banco.
*   **Player Ao Vivo Otimizado:** Barra fixa de áudio (`player-bar`) com controle de stream compatível com conexões Icecast/Shoutcast HTTPS.

## 🚀 Como Iniciar (Produção)

1. **Configuração Supabase:** Todo o schema (tabelas e RLS) foi importado através do arquivo `supabase_setup.sql`. O `assets/scripts/supabase-client.js` possui a Anon Key e a URL do seu projeto.
2. **Acessar Admin:** Acesse `admin/index.html` em seu servidor.
3. **Primeiro Login:** Use a conta de Administrador criada via Supabase. Seu UUID precisa estar atrelado à tabela `admins` para garantir autorização de escrita.
4. **Site Público:** Acesse `index.html`. O site puxará imediatamente a grade de programação, notícias, capa da rádio e os planos de publicidade do Supabase.

## 🗂 Estrutura de Diretórios

```
RADIO AGAPE/
├── index.html                   ← Site público principal
├── assets/
│   ├── scripts/
│   │   ├── main.js              ← Animações de fundo, navegação, eventos
│   │   └── supabase-client.js   ← Integração de Banco de Dados / Cache
│   └── styles/                  ← Vanilla CSS (Variáveis, grids, efeitos)
│
├── modules/
│   ├── loader.js                ← Micro-frontend loader
│   └── components/              ← HTML particionado em seções
│
└── admin/                       ← Painel Administrativo
    ├── index.html               ← Telas do CMS
    ├── styles/                  ← CSS próprio para o painel
    ├── scripts/                 ← Lógica de Auth e upload seguro
    └── modules/                 ← Scripts modulares de CRUD para as abas
```

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** HTML5, Vanilla JavaScript, CSS3
*   **Integração:** `supabase-js` (via CDN)
*   **Backend as a Service:** Supabase (Auth, Postgres, Storage, Row Level Security)
*   **Modularidade:** Fetch API para injeção HTML de seções independentes.

---

> O Senhor te abençoe e te guarde; O Senhor faça resplandecer o seu rosto sobre ti. (Números 6:24-25)
