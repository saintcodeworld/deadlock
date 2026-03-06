import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
const DEV_WALLET = process.env.NEXT_PUBLIC_DEV_WALLET || ''
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_PUMP_FUN_TOKEN_ADDRESS || ''

/**
 * Send SOL from the connected wallet to the dev wallet for a devbuy.
 * The dev wallet will then use these funds to buy the token on pump.fun.
 *
 * In production, this would integrate with pump.fun's swap API directly.
 * For now, it sends SOL to the dev wallet which triggers the buy server-side.
 */
export async function executeDevBuy(
  amount: number,
  walletPublicKey: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string | null> {
  if (!DEV_WALLET) {
    console.error('[DevBuy] NEXT_PUBLIC_DEV_WALLET not configured')
    return null
  }

  if (amount <= 0) {
    console.warn('[DevBuy] Amount must be > 0')
    return null
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed')
    const devPubkey = new PublicKey(DEV_WALLET)

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: devPubkey,
        lamports: Math.round(amount * LAMPORTS_PER_SOL),
      })
    )

    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = walletPublicKey

    const signed = await signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signed.serialize())
    await connection.confirmTransaction(signature, 'confirmed')

    console.log(`[DevBuy] ✅ ${amount} SOL sent to dev wallet. TX: ${signature}`)
    console.log(`[DevBuy] Token: ${TOKEN_ADDRESS}`)

    return signature
  } catch (error) {
    console.error('[DevBuy] Transaction failed:', error)
    return null
  }
}

/**
 * Trigger a server-side devbuy using the dev wallet's private key.
 * This calls the /api/devbuy endpoint which sends SOL from the dev wallet
 * to buy the token at NEXT_PUBLIC_PUMP_FUN_TOKEN_ADDRESS.
 *
 * Called automatically when:
 * - A user correctly guesses the eliminated room (free prediction → 0.01 SOL per correct guess)
 * - No gambling winners exist (entire pot → devbuy)
 */
export async function triggerServerDevBuy(
  amount: number,
): Promise<{ success: boolean; signature?: string; error?: string }> {
  console.log(`[DevBuy] 🔵 triggerServerDevBuy called with amount: ${amount}`)
  
  if (amount <= 0) {
    console.warn('[DevBuy] ⚠️ Amount must be > 0')
    return { success: false, error: 'Amount must be > 0' }
  }

  try {
    console.log(`[DevBuy] 📡 Sending POST to /api/devbuy with body:`, { amount })
    const response = await fetch('/api/devbuy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })

    console.log(`[DevBuy] 📡 Response status: ${response.status}`)
    
    const data = await response.json()
    console.log(`[DevBuy] 📡 Response data:`, data)

    if (data.success) {
      console.log(`[DevBuy] ✅ Server devbuy executed: ${amount} SOL → ${data.tokenAddress}`)
      console.log(`[DevBuy] ✅ TX: ${data.signature}`)
      console.log(`[DevBuy] ✅ View at: https://solscan.io/tx/${data.signature}`)
      return { success: true, signature: data.signature }
    } else {
      console.error(`[DevBuy] ❌ Server devbuy failed: ${data.error}`)
      console.error(`[DevBuy] ❌ Details:`, data.details)
      return { success: false, error: data.error }
    }
  } catch (error: any) {
    console.error('[DevBuy] ❌ Server devbuy request failed:', error)
    console.error('[DevBuy] ❌ Error stack:', error?.stack)
    return { success: false, error: error?.message || 'Request failed' }
  }
}

/**
 * Send gambling bet SOL from player to the game escrow (dev wallet for now).
 * In production this would go to a program-controlled escrow account.
 */
export async function sendGamblingBetTransaction(
  amount: number,
  walletPublicKey: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string | null> {
  if (!DEV_WALLET) {
    console.error('[GamblingBet] NEXT_PUBLIC_DEV_WALLET not configured')
    return null
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed')
    const devPubkey = new PublicKey(DEV_WALLET)

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: devPubkey,
        lamports: Math.round(amount * LAMPORTS_PER_SOL),
      })
    )

    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = walletPublicKey

    const signed = await signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signed.serialize())
    await connection.confirmTransaction(signature, 'confirmed')

    console.log(`[GamblingBet] ✅ ${amount} SOL escrowed. TX: ${signature}`)
    return signature
  } catch (error) {
    console.error('[GamblingBet] Transaction failed:', error)
    return null
  }
}
