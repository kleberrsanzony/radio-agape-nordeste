-- ==============================================================================
-- 📻 RÁDIO ÁGAPE NORDESTE - BANCO DE DADOS SUPABASE (PRODUÇÃO)
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABELA DE ADMINISTRADORES (Role Based Access Control)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ler (para verificar se é admin no frontend, opcional, mas seguro)
CREATE POLICY "Admins are viewable by everyone" ON public.admins FOR SELECT USING (true);
-- Policy: Apenas o próprio supabase auth ou um admin logado poderia inserir. Por segurança, gerido via trigger ou manual.

-- ==============================================================================
-- 3. TABELA DE CONFIGURAÇÕES GERAIS (Player, Contatos, etc)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_config (
    id TEXT PRIMARY KEY, -- ex: 'player_config', 'contact_config'
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 4. TABELA DE PROGRAMAÇÃO (Schedule)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Seg, 6=Dom
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    program_name TEXT NOT NULL,
    presenter TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. TABELA DE MÚSICAS (Top 6)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.music (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    cover_url TEXT,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 6. TABELA DE PROGRAMAS (Cards na Home)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    schedule_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 7. TABELA DE NOTÍCIAS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Geral',
    image_url TEXT,
    author TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 8. TABELA DE ANÚNCIOS (Planos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    price TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- 9. POLÍTICAS RLS (Row Level Security) - REGRAS DE ACESSO
-- ==============================================================================

-- Função auxiliar para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- APPLICAR RLS PARA TODAS AS TABELAS:
-- Leitura (SELECT) permitida para TODOS (Visitantes do site público)
-- Escrita (INSERT, UPDATE, DELETE) permitida APENAS para Admins.

DO $$
DECLARE
    table_name text;
    tables text[] := ARRAY['site_config', 'schedule', 'music', 'programs', 'news', 'ads'];
BEGIN
    FOREACH table_name IN ARRAY tables LOOP
        -- SELECT: PUBLIC
        EXECUTE format('CREATE POLICY "Public read access for %I" ON public.%I FOR SELECT USING (true);', table_name, table_name);
        
        -- INSERT: ADMIN
        EXECUTE format('CREATE POLICY "Admin insert access for %I" ON public.%I FOR INSERT WITH CHECK (public.is_admin());', table_name, table_name);
        
        -- UPDATE: ADMIN
        EXECUTE format('CREATE POLICY "Admin update access for %I" ON public.%I FOR UPDATE USING (public.is_admin());', table_name, table_name);
        
        -- DELETE: ADMIN
        EXECUTE format('CREATE POLICY "Admin delete access for %I" ON public.%I FOR DELETE USING (public.is_admin());', table_name, table_name);
    END LOOP;
END
$$;


-- ==============================================================================
-- 10. CRIAÇÃO DOS STORAGE BUCKETS (Imagens) E RLS
-- ==============================================================================
-- Supabase exige comandos específicos para buckets:
INSERT INTO storage.buckets (id, name, public) VALUES 
('covers', 'covers', true),
('news', 'news', true),
('hosts', 'hosts', true),
('ads', 'ads', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Para Storage Buckets:
-- (Leitura pública, Upload/Update/Delete restrito a usuários autenticados (admins))
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('covers', 'news', 'hosts', 'ads') );
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK ( auth.role() = 'authenticated' );
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING ( auth.role() = 'authenticated' );
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING ( auth.role() = 'authenticated' );


-- ==============================================================================
-- 11. INSERÇÃO DE DADOS DE FALLBACK (Dados Iniciais p/ o Site não quebrar)
-- ==============================================================================

INSERT INTO public.site_config (id, data) VALUES
('player_config', '{"playerTitle": "Rádio Ágape Nordeste", "playerDesc": "Ao Vivo - Sintonize com a Graça", "streamUrl": "https://stream.radioagape.com/live", "enableVolume": true}'),
('contact_config', '{"email": "contato@radioagape.com", "phone": "(00) 00000-0000", "instagram": "@radioagape"}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

-- Insere um programa de exemplo para a Grade de Programação
INSERT INTO public.schedule (day_of_week, start_time, duration_minutes, program_name, presenter) 
VALUES (0, '07:00:00', 120, 'Manhã com Deus', 'Pr. João Silva')
ON CONFLICT DO NOTHING;

-- Insere um programa (card) de exemplo
INSERT INTO public.programs (title, description, schedule_text)
VALUES ('Manhã com Deus', 'Comece seu dia com mensagens inspiradoras.', 'Seg a Sex às 07h')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- FIM DO SCRIPT
-- IMPORTANTE: Para criar um admin, vá no painel do Supabase -> Authentication -> Add User.
-- Depois, copie o UUID desse usuário e insira na tabela 'admins':
-- INSERT INTO public.admins (id, email) VALUES ('uuid-copiado-aqui', 'email@admin.com');
-- ==============================================================================
