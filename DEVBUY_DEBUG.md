# DevBuy Debug Guide

## What Should Happen

When a player places a **free bet** on a room and the killer kills that room:
1. Game transitions to `result` phase
2. `GameContext.tsx` calculates `devBuyAmount = 0.01 SOL` (per correct free bet)
3. Calls `triggerServerDevBuy(0.01)`
4. `/api/devbuy` endpoint receives the request
5. Server uses `DEV_PRIVATE_KEY` to buy tokens via PumpPortal
6. Transaction is sent to Solana blockchain
7. Console shows success with TX signature

## How to Test (Step by Step)

### Method 1: Quick Test with Dev Panel

1. **Open browser console** (F12 or Cmd+Option+I)
2. Click **"DEV TEST"** button (bottom-left)
3. Click **"1. Bet All"** (places free bets on all 7 rooms)
4. Click **"2. Skip Timer"** (skips 60s wait)
5. Watch the killer knock on doors and kill a room
6. **Check console** for these logs:

```
[Game] 🔍 Result phase — killed room: X
[Game] 🔍 Killed room free bets: 1
[Game] 🔍 devBuyAmount: 0.01 SOL
[Game] 🚀 Triggering devbuy of 0.01 SOL...
[DevBuy] 🔵 triggerServerDevBuy called with amount: 0.01
[DevBuy] 📡 Sending POST to /api/devbuy
[DevBuy] 📡 Response status: 200
[DevBuy] ✅ Server devbuy executed
[DevBuy] ✅ TX: <signature>
```

### Method 2: Direct API Test

1. Click **"DEV TEST"** button
2. In "Direct Devbuy API Test" section, enter `0.001` SOL
3. Click **"BUY"**
4. **Check console** for response

## What to Check if DevBuy Isn't Working

### 1. Check Environment Variables

Open `.env` file and verify:
```bash
DEV_PRIVATE_KEY=<your-base58-private-key>
NEXT_PUBLIC_PUMP_FUN_TOKEN_ADDRESS=<token-mint-address>
NEXT_PUBLIC_SOLANA_RPC_URL=<your-rpc-url>
```

### 2. Check Browser Console

Look for these specific log patterns:

**✅ Good signs:**
- `[Game] 🚀 Triggering devbuy of X SOL...`
- `[DevBuy] 📡 Response status: 200`
- `[DevBuy] ✅ Server devbuy executed`

**❌ Bad signs:**
- `[Game] ⚠️ No devbuy — devBuyAmount is 0` → No correct free bets
- `[DevBuy] ❌ Server devbuy failed` → API error
- `[Game] ❌ Devbuy failed` → Check error message
- No logs at all → Result phase not triggering

### 3. Check Server Console (Terminal)

In your Next.js dev server terminal, look for:
```
[DevBuy API] Executing devbuy: 0.01 SOL → token <address>
[DevBuy API] Dev wallet: <public-key>
[DevBuy API] TX sent, awaiting confirmation: <signature>
[DevBuy API] ✅ Devbuy confirmed
```

**Common errors:**
- `DEV_PRIVATE_KEY not configured` → Missing env var
- `PumpPortal error (XXX)` → API issue or invalid token
- `Transaction failed` → Insufficient SOL or network issue

### 4. Check Live State in Dev Panel

The Dev Panel shows real-time state:
- **Phase**: Should show `result` after killing
- **Free bets**: Should show > 0 if you placed bets
- **Killed room**: Should show room number (1-7)
- **DevBuy amt**: Should show `0.01` if a free bet was correct
- **Correct bets**: Should show `1` or more

### 5. Verify Free Bets Are Placed

During betting phase, check console for:
```
[Game] 📸 Snapshotted rooms at knocking start: [...]
```

This should show `freeBets: 7` if you clicked "Bet All"

### 6. Verify Result Phase Triggers

When killer finishes killing, check for:
```
[Game] 🔍 Result phase — killed room: X
[Game] 🔍 Snapshot rooms bets: [...]
```

If you don't see this, the result phase isn't triggering.

## Common Issues

### Issue: "No devbuy — devBuyAmount is 0"

**Cause**: No free bets matched the killed room, or bets weren't captured in snapshot.

**Fix**: 
- Use "Bet All" button to guarantee a match
- Check snapshot logs show `freeBets: 7`

### Issue: "Server devbuy failed: Server not configured"

**Cause**: `DEV_PRIVATE_KEY` missing from `.env`

**Fix**: Add your base58 private key to `.env`

### Issue: "PumpPortal trade request failed"

**Cause**: Invalid token address or PumpPortal API issue

**Fix**: 
- Verify `NEXT_PUBLIC_PUMP_FUN_TOKEN_ADDRESS` is correct
- Check token exists on pump.fun

### Issue: No logs appear at all

**Cause**: Result phase not triggering or React effect not running

**Fix**:
- Restart dev server
- Clear browser cache
- Check for JavaScript errors in console

## Expected Transaction Flow

1. **Client** (GameContext) → `triggerServerDevBuy(0.01)`
2. **Client** (devbuy.ts) → `POST /api/devbuy` with `{ amount: 0.01 }`
3. **Server** (route.ts) → Decode `DEV_PRIVATE_KEY`
4. **Server** → `POST https://pumpportal.fun/api/trade-local`
5. **PumpPortal** → Returns signed transaction
6. **Server** → Signs with dev keypair
7. **Server** → Sends to Solana RPC
8. **Solana** → Confirms transaction
9. **Server** → Returns `{ success: true, signature: "..." }`
10. **Client** → Logs success + TX link

## Manual Test Commands

Test the API directly with curl:
```bash
curl -X POST http://localhost:3000/api/devbuy \
  -H "Content-Type: application/json" \
  -d '{"amount": 0.001}'
```

Expected response:
```json
{
  "success": true,
  "signature": "...",
  "amount": 0.001,
  "tokenAddress": "..."
}
```
