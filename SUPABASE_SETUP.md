# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization and set:
   - **Project Name**: slasher-game (or your choice)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
5. Wait for the project to be created (~2 minutes)

## 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is correct!

## 3. Get Your API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Find these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## 4. Configure Your Environment

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Also fill in your existing Solana configuration:
   ```
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_PUMP_FUN_TOKEN_ADDRESS=your_token_address
   NEXT_PUBLIC_DEV_WALLET=your_dev_wallet_public_key
   DEV_PRIVATE_KEY=your_base58_private_key
   ```

## 5. Verify Setup

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Check the browser console - you should NOT see any Supabase warnings
3. Open the app in two different browser windows/tabs
4. Place a bet in one window - you should see it appear in the other window in real-time!

## 6. Enable Realtime (CRITICAL - Required for Multiplayer!)

**⚠️ WITHOUT THIS STEP, PLAYERS WON'T SEE EACH OTHER IN REAL-TIME! ⚠️**

1. In Supabase dashboard, go to **Database** → **Replication** (left sidebar)
2. Find these tables and **ENABLE replication** for each:
   - ✅ `bets` - Toggle the switch ON
   - ✅ `game_sessions` - Toggle the switch ON
   - ✅ `player_positions` - Toggle the switch ON

**How to verify it's enabled:**
- Each table should show "Source: 1" with a green/active toggle
- The replication switch should be in the ON position

**If you skip this step:**
- Bets will save to database
- But players won't see each other until they refresh
- Real-time sync will not work

## Troubleshooting

- **"Supabase credentials not configured"**: Check your `.env.local` file exists and has the correct values
- **Bets not syncing**: Make sure realtime replication is enabled (step 6)
- **Connection errors**: Verify your Supabase project is running and the URL is correct
- **RLS errors**: The schema includes permissive policies for development. For production, you should restrict these.

## Production Considerations

Before deploying to production:

1. **Row Level Security**: Update the RLS policies to be more restrictive
2. **Rate Limiting**: Consider adding rate limits to prevent abuse
3. **Wallet Verification**: Add proper wallet signature verification
4. **Session Cleanup**: Set up a cron job to run `cleanup_old_sessions()` periodically
