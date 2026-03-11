# Quick Start - Get Multiplayer Working in 5 Minutes

## The Problem You're Experiencing

You and your friend place bets, but you can't see each other until you refresh. This is because **Supabase Realtime replication is not enabled**.

## The Solution (5 Steps)

### 1. Create Supabase Project (2 min)
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Name it anything (e.g., "slasher-game")
4. Set a database password (save it!)
5. Choose a region and click "Create"
6. Wait ~2 minutes for it to finish

### 2. Run the Database Schema (1 min)
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase-schema.sql` from your project
4. Copy ALL the contents
5. Paste into the SQL editor
6. Click **Run** (or press Cmd+Enter)
7. Should see "Success. No rows returned" ✅

### 3. Enable Realtime (1 min) - CRITICAL!
1. In Supabase dashboard, click **Database** → **Replication**
2. Find the table `bets` and toggle the switch **ON**
3. Find the table `game_sessions` and toggle the switch **ON**
4. Find the table `player_positions` and toggle the switch **ON**

**This is the most important step!** Without it, real-time sync won't work.

### 4. Get Your API Keys (30 sec)
1. In Supabase dashboard, click **Settings** → **API**
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy your **anon public** key (long string starting with `eyJ...`)

### 5. Add to Your Project (30 sec)
1. In your project folder, create a file called `.env.local`
2. Add these lines (replace with your actual values):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Also add your existing Solana config:
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PUMP_FUN_TOKEN_ADDRESS=your_token_address
NEXT_PUBLIC_DEV_WALLET=your_dev_wallet_public_key
DEV_PRIVATE_KEY=your_base58_private_key
```

3. Restart your dev server:
```bash
# Stop it (Ctrl+C)
npm run dev
```

## Test It Works

1. Open http://localhost:3000 in **two browser windows** side-by-side
2. Open browser console (F12) in both windows
3. Look for this message: `[Multiplayer] ✅ Real-time sync active!`
4. In Window 1: Place a free bet on Room 1
5. In Window 2: You should see the bet appear **instantly** without refreshing!

## If It's Not Working

### Check Browser Console
Open console (F12) and look for:
- ✅ `[Multiplayer] ✅ Real-time sync active!` = Working!
- ❌ `[Multiplayer] ❌ Channel error` = Realtime not enabled (go back to Step 3)

### Most Common Issues:
1. **Forgot to enable replication** → Go to Step 3
2. **Didn't restart dev server** → Stop and run `npm run dev` again
3. **Wrong API keys** → Check Step 4 and 5

### Still stuck?
Read `REALTIME_TROUBLESHOOTING.md` for detailed debugging steps.

## What You'll See When It Works

- **Player avatars** appear in rooms when bets are placed
- **Bet counts** update instantly across all windows
- **SOL amounts** sync in real-time
- **No refresh needed** - everything updates automatically

---

**That's it! Your game is now multiplayer.** 🎮✨
