-- ============================================================
-- DEADLOCK SLASHER GAME - COMPLETE SUPABASE SCHEMA
-- ============================================================
-- Run this entire file in your Supabase SQL Editor
-- This will create all tables, indexes, policies, and functions
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- DROP EXISTING TABLES (if you want a clean slate)
-- ============================================================
-- Uncomment these lines if you want to completely reset your database
-- WARNING: This will delete ALL existing game data!
-- DROP TABLE IF EXISTS player_positions CASCADE;
-- DROP TABLE IF EXISTS bets CASCADE;
-- DROP TABLE IF EXISTS game_sessions CASCADE;

-- ============================================================
-- TABLE: game_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_number INTEGER NOT NULL DEFAULT 1,
  game_phase TEXT NOT NULL CHECK (game_phase IN ('betting', 'knocking', 'killing', 'result')),
  round_time_remaining INTEGER NOT NULL DEFAULT 60,
  -- Killer 1
  killer_position_x NUMERIC NOT NULL DEFAULT 340,
  killer_position_y NUMERIC NOT NULL DEFAULT 375,
  killer_target_room INTEGER,
  killer_knocking_room INTEGER,
  killer_kill_rooms INTEGER[] DEFAULT '{}',
  -- Killer 2
  killer2_position_x NUMERIC NOT NULL DEFAULT 380,
  killer2_position_y NUMERIC NOT NULL DEFAULT 375,
  killer2_target_room INTEGER,
  killer2_knocking_room INTEGER,
  killer2_kill_rooms INTEGER[] DEFAULT '{}',
  -- Surviving room (1 of 7)
  surviving_room INTEGER,
  -- Kill sequence (step-by-step)
  kill_sequence JSONB DEFAULT '[]',
  kill_step INTEGER DEFAULT -1,
  -- Knock sequences
  knock_sequence INTEGER[],
  knock2_sequence INTEGER[],
  knock_index INTEGER DEFAULT 0,
  is_killing BOOLEAN DEFAULT FALSE,
  total_pot NUMERIC DEFAULT 0,
  killed_room INTEGER,
  devbuy_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  betting_ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  game_master_id TEXT,
  game_master_last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: bets
-- ============================================================
CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  room_id INTEGER NOT NULL CHECK (room_id BETWEEN 1 AND 7),
  bet_type TEXT NOT NULL CHECK (bet_type IN ('free', 'gambling')),
  amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: player_positions
-- ============================================================
CREATE TABLE IF NOT EXISTS player_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  room_id INTEGER CHECK (room_id BETWEEN 1 AND 7),
  position_x NUMERIC,
  position_y NUMERIC,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, wallet_address)
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bets_session ON bets(session_id);
CREATE INDEX IF NOT EXISTS idx_bets_wallet ON bets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_player_positions_session ON player_positions(session_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_active ON game_sessions(is_active) WHERE is_active = TRUE;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_positions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DROP EXISTING POLICIES (to avoid conflicts on re-run)
-- ============================================================
DROP POLICY IF EXISTS "Allow all to read game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Allow all to insert game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Allow all to update game sessions" ON game_sessions;

DROP POLICY IF EXISTS "Allow all to read bets" ON bets;
DROP POLICY IF EXISTS "Allow all to insert bets" ON bets;
DROP POLICY IF EXISTS "Allow all to delete bets" ON bets;

DROP POLICY IF EXISTS "Allow all to read player positions" ON player_positions;
DROP POLICY IF EXISTS "Allow all to insert player positions" ON player_positions;
DROP POLICY IF EXISTS "Allow all to update player positions" ON player_positions;
DROP POLICY IF EXISTS "Allow all to delete player positions" ON player_positions;

-- ============================================================
-- POLICIES: game_sessions
-- ============================================================
CREATE POLICY "Allow all to read game sessions" 
  ON game_sessions FOR SELECT 
  USING (true);

CREATE POLICY "Allow all to insert game sessions" 
  ON game_sessions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all to update game sessions" 
  ON game_sessions FOR UPDATE 
  USING (true);

-- ============================================================
-- POLICIES: bets
-- ============================================================
CREATE POLICY "Allow all to read bets" 
  ON bets FOR SELECT 
  USING (true);

CREATE POLICY "Allow all to insert bets" 
  ON bets FOR INSERT 
  WITH CHECK (true);

-- CRITICAL FIX: This policy was missing, causing round resets to fail
CREATE POLICY "Allow all to delete bets" 
  ON bets FOR DELETE 
  USING (true);

-- ============================================================
-- POLICIES: player_positions
-- ============================================================
CREATE POLICY "Allow all to read player positions" 
  ON player_positions FOR SELECT 
  USING (true);

CREATE POLICY "Allow all to insert player positions" 
  ON player_positions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all to update player positions" 
  ON player_positions FOR UPDATE 
  USING (true);

CREATE POLICY "Allow all to delete player positions" 
  ON player_positions FOR DELETE 
  USING (true);

-- ============================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER: Auto-update updated_at on game_sessions
-- ============================================================
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON game_sessions;

CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: Cleanup old inactive sessions
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  UPDATE game_sessions 
  SET is_active = FALSE 
  WHERE updated_at < NOW() - INTERVAL '1 hour' AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ENABLE REALTIME REPLICATION (CRITICAL FOR MULTIPLAYER)
-- ============================================================
-- This enables realtime subscriptions for multiplayer features
-- Without this, players won't see each other's bets or positions

-- Note: You may need to enable these in the Supabase Dashboard instead:
-- Go to Database → Replication → Enable replication for these tables

-- For Supabase CLI or direct SQL, use:
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE bets;
ALTER PUBLICATION supabase_realtime ADD TABLE player_positions;

-- ============================================================
-- TABLE: chat_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL DEFAULT 'Anon',
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering by time
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts on re-run
DROP POLICY IF EXISTS "Allow all to read chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow all to insert chat messages" ON chat_messages;

-- Policies: anyone can read and send
CREATE POLICY "Allow all to read chat messages"
  ON chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ============================================================
-- DONE!
-- ============================================================
-- Your database is now ready for the DEADLOCK game
-- All tables, policies, and realtime features are configured
-- ============================================================
