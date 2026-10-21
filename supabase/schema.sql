-- ==============================================================================
-- SISTEM CABUTAN BERTUAH MULTI-EVENT (LUCKY DRAW SYSTEM)
-- SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running (Clean slate)
DROP TABLE IF EXISTS winners CASCADE;
DROP TABLE IF EXISTS prizes CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- 3. Table: events (Pengurusan Program / Majlis)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    event_date DATE DEFAULT CURRENT_DATE,
    bg_image_url TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#EAB308', -- Default Gold Accent
    theme_preset TEXT DEFAULT 'gold',     -- 'gold', 'emerald', 'royal_blue', 'neon_purple'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: participants (Peserta / Tiket Tuah)
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    ticket_number TEXT NOT NULL,
    department TEXT DEFAULT 'Umum',
    is_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_ticket_per_event UNIQUE(event_id, ticket_number)
);

-- 5. Table: prizes (Senarai Hadiah - 74 Hadiah)
CREATE TABLE prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Saguhati', -- 'Grand Prize' atau 'Saguhati'
    image_url TEXT,
    rank_order INT NOT NULL,          -- 1 hingga 74 (1 = Grand Prize No. 1)
    draw_type TEXT NOT NULL DEFAULT 'batch' CHECK (draw_type IN ('batch', 'single')),
    batch_size INT NOT NULL DEFAULT 10, -- 10 untuk Saghati, 1 untuk Single
    is_drawn BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_rank_per_event UNIQUE(event_id, rank_order)
);

-- 6. Table: winners (Pemenang Cabutan)
CREATE TABLE winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    prize_id UUID NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    won_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    CONSTRAINT unique_winner_prize UNIQUE(prize_id, participant_id)
);

-- 7. Performance Indexes
CREATE INDEX idx_participants_event_winner ON participants(event_id, is_winner);
CREATE INDEX idx_prizes_event_rank ON prizes(event_id, rank_order);
CREATE INDEX idx_winners_event ON winners(event_id);
CREATE INDEX idx_winners_prize ON winners(prize_id);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies: Allow public read and write (Sesuai untuk event kiosk & demo)
-- Untuk keselamatan lanjutan, boleh ganti dengan auth.role() = 'authenticated'
CREATE POLICY "Public full access events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access participants" ON participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access prizes" ON prizes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access winners" ON winners FOR ALL USING (true) WITH CHECK (true);

-- 10. Helper Function: Seed standard 74 prizes for an event
-- Hadiah 74 - 34: Saguhati / Cabutan Sampingan (Batch Mode 10 nama)
-- Hadiah 33 - 1: Hadiah Utama / Grand Prizes (Single Mode 1-by-1)
CREATE OR REPLACE FUNCTION seed_default_74_prizes(target_event_id UUID)
RETURNS VOID AS $$
DECLARE
    i INT;
    p_name TEXT;
    p_category TEXT;
    p_draw_type TEXT;
    p_batch_size INT;
BEGIN
    -- Saguhati / Sampingan (74 hingga 34) -> 41 Hadiah (Dikelompokkan secara Batch 10)
    FOR i IN 34..74 LOOP
        p_name := 'Hadiah Saguhati #' || i;
        p_category := 'Hadiah Sampingan';
        p_draw_type := 'batch';
        p_batch_size := 10;
        
        INSERT INTO prizes (event_id, name, category, rank_order, draw_type, batch_size)
        VALUES (target_event_id, p_name, p_category, i, p_draw_type, p_batch_size)
        ON CONFLICT (event_id, rank_order) DO UPDATE
        SET name = EXCLUDED.name, category = EXCLUDED.category, draw_type = EXCLUDED.draw_type;
    END LOOP;

    -- Hadiah Utama (33 hingga 1) -> 33 Hadiah (Single Mode 1-by-1)
    FOR i IN REVERSE 33..1 LOOP
        p_category := 'Hadiah Utama';
        p_draw_type := 'single';
        p_batch_size := 1;
        
        IF i = 1 THEN
            p_name := 'HADIAH UTAMA #1: Kereta / Motosikal / Pakej Percutian Mewah';
        ELSIF i = 2 THEN
            p_name := 'HADIAH UTAMA #2: iPhone 16 Pro Max / Laptop Gaming';
        ELSIF i = 3 THEN
            p_name := 'HADIAH UTAMA #3: Smart TV 65 Inch UHD 4K';
        ELSIF i = 4 THEN
            p_name := 'HADIAH UTAMA #4: iPad Air M2 + Apple Pencil';
        ELSIF i = 5 THEN
            p_name := 'HADIAH UTAMA #5: Peti Sejuk 2 Pintu Inverter';
        ELSIF i <= 10 THEN
            p_name := 'Hadiah Khas Top 10 #' || i || ' (Peralatan Elektrik Premium)';
        ELSE
            p_name := 'Hadiah Utama #' || i;
        END IF;

        INSERT INTO prizes (event_id, name, category, rank_order, draw_type, batch_size)
        VALUES (target_event_id, p_name, p_category, i, p_draw_type, p_batch_size)
        ON CONFLICT (event_id, rank_order) DO UPDATE
        SET name = EXCLUDED.name, category = EXCLUDED.category, draw_type = EXCLUDED.draw_type;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Contoh Cara Penggunaan di Supabase SQL Editor:
-- INSERT INTO events (name, description) VALUES ('Malam Gala Gemilang 2026', 'Cabutan Bertuah Tahunan');
-- SELECT seed_default_74_prizes((SELECT id FROM events LIMIT 1));
