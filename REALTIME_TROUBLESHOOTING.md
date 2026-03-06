# Real-Time Multiplayer Troubleshooting Guide

## Issue: Players Can't See Each Other Until Refresh

If you and your friend place bets but don't see each other's bets in real-time, follow these steps:

## ✅ Step 1: Verify Supabase Realtime is Enabled

This is the **most common issue**. Supabase Realtime must be explicitly enabled for each table.

### How to Enable Realtime:

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Replication** (left sidebar)
3. Find these tables and **toggle ON** the replication switch for each:
   - ✅ `bets`
   - ✅ `game_sessions`
   - ✅ `player_positions`

**Important:** All three tables MUST have replication enabled!

### Visual Guide:
```
Database → Replication
┌─────────────────────────────────────┐
│ Table: bets                         │
│ Source: 1  [●] Enable replication   │ ← Turn this ON
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Table: game_sessions                │
│ Source: 1  [●] Enable replication   │ ← Turn this ON
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Table: player_positions             │
│ Source: 1  [●] Enable replication   │ ← Turn this ON
└─────────────────────────────────────┘
```

## ✅ Step 2: Check Browser Console

Open the browser console (F12 or Right-click → Inspect → Console) and look for these messages:

### ✅ Good Signs (Working):
```
[Multiplayer] 🔌 Setting up real-time subscriptions for session: abc123...
[Multiplayer] 📡 Subscription status: SUBSCRIBED
[Multiplayer] ✅ Real-time sync active!
[Multiplayer] 📥 New bet received: {bet_type: 'free', room_id: 1, ...}
```

### ❌ Bad Signs (Not Working):
```
[Multiplayer] ❌ Channel error - check Supabase realtime is enabled
[Multiplayer] ⏱️ Subscription timed out
```

If you see errors, go back to Step 1 and enable replication.

## ✅ Step 3: Verify Environment Variables

Make sure `.env.local` exists with correct Supabase credentials:

```bash
# Check if file exists
ls -la .env.local

# Should contain:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**After adding/changing `.env.local`, you MUST restart the dev server:**
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Step 4: Test Real-Time Sync

### Test Setup:
1. Open the game in **two different browser windows** (side by side)
2. Open browser console in **both windows** (F12)
3. Watch the console logs

### Test Actions:

**Window 1:**
- Place a free bet on Room 1
- Watch console for: `[Multiplayer] 📥 New bet received`

**Window 2:**
- Should see the same log appear
- Room 1 should show the bet count increase
- Player avatar should appear in Room 1

### What Should Happen:
- **Instant update** (within 1 second)
- No page refresh needed
- Both windows show the same data

## ✅ Step 5: Check Supabase Dashboard

### Verify Data is Being Saved:

1. Go to Supabase Dashboard → **Table Editor**
2. Check the `bets` table
3. You should see rows with your bets

### Check Active Connections:

1. Go to **Database** → **Roles**
2. Look for active connections
3. Should see connections from your app

## Common Issues & Solutions

### Issue: "Cannot find module '@/context/GameContext'"
**Solution:** This is a TypeScript error that appears during development but doesn't affect runtime. The code will still work.

### Issue: Bets save but don't sync in real-time
**Solution:** 
1. Enable replication (Step 1)
2. Restart dev server
3. Hard refresh both browser windows (Cmd+Shift+R or Ctrl+Shift+R)

### Issue: "Subscription status: CHANNEL_ERROR"
**Solution:**
1. Check Supabase project is not paused (free tier pauses after inactivity)
2. Verify your Supabase URL and anon key are correct
3. Enable replication for all three tables

### Issue: Works in one window but not the other
**Solution:**
1. Make sure both windows are using the same session
2. Check both windows are connected (look for subscription logs)
3. Try opening both windows in incognito mode

### Issue: "Realtime is not enabled for this project"
**Solution:**
1. Supabase free tier includes Realtime
2. Go to **Project Settings** → **API**
3. Verify Realtime is enabled
4. If not, contact Supabase support

## Testing Checklist

- [ ] Supabase project created
- [ ] SQL schema executed successfully
- [ ] Replication enabled for `bets` table
- [ ] Replication enabled for `game_sessions` table
- [ ] Replication enabled for `player_positions` table
- [ ] `.env.local` file exists with correct credentials
- [ ] Dev server restarted after adding `.env.local`
- [ ] Browser console shows "Real-time sync active!"
- [ ] Two browser windows open side-by-side
- [ ] Bet placed in Window 1 appears in Window 2 without refresh

## Still Not Working?

### Debug Mode:

Add this to your browser console to see detailed Supabase logs:
```javascript
localStorage.setItem('supabase.debug', 'true')
```

Then refresh the page and check for detailed connection logs.

### Check Supabase Status:
Visit https://status.supabase.com/ to ensure there are no outages.

### Verify Your Setup:

Run this in browser console on your game page:
```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

Should show your URL and `true` for the key.

## Need More Help?

1. Check browser console for specific error messages
2. Check Supabase dashboard logs
3. Verify all three tables have replication enabled
4. Make sure you're testing with two separate browser windows
5. Try clearing browser cache and restarting

---

**Most Common Fix:** Enable replication in Supabase Dashboard → Database → Replication for all three tables, then restart your dev server!
