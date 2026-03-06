import { NextRequest, NextResponse } from 'next/server'
import { VersionedTransaction, Connection, Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
const DEV_PRIVATE_KEY = process.env.DEV_PRIVATE_KEY || ''
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_PUMP_FUN_TOKEN_ADDRESS || ''

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!DEV_PRIVATE_KEY) {
      console.error('[DevBuy API] DEV_PRIVATE_KEY not configured')
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    if (!TOKEN_ADDRESS) {
      console.error('[DevBuy API] TOKEN_ADDRESS not configured')
      return NextResponse.json({ error: 'Token address not configured' }, { status: 500 })
    }

    // Decode dev wallet keypair from base58 private key
    const devKeypair = Keypair.fromSecretKey(bs58.decode(DEV_PRIVATE_KEY))
    const devPublicKey = devKeypair.publicKey.toBase58()

    console.log(`[DevBuy API] Executing devbuy: ${amount} SOL → token ${TOKEN_ADDRESS}`)
    console.log(`[DevBuy API] Dev wallet: ${devPublicKey}`)

    // Step 1: Request a buy transaction from PumpPortal's local trade API
    const pumpResponse = await fetch('https://pumpportal.fun/api/trade-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey: devPublicKey,
        action: 'buy',
        mint: TOKEN_ADDRESS,
        amount: amount,
        denominatedInSol: 'true',
        slippage: 25,
        priorityFee: 0.0005,
        pool: 'auto',
      }),
    })

    if (pumpResponse.status !== 200) {
      const errorText = await pumpResponse.text()
      console.error(`[DevBuy API] PumpPortal error (${pumpResponse.status}): ${errorText}`)
      return NextResponse.json(
        { error: 'PumpPortal trade request failed', details: errorText },
        { status: 502 }
      )
    }

    // Step 2: Deserialize the transaction returned by PumpPortal
    const txData = await pumpResponse.arrayBuffer()
    const tx = VersionedTransaction.deserialize(new Uint8Array(txData))

    // Step 3: Sign the transaction with the dev wallet keypair
    tx.sign([devKeypair])

    // Step 4: Send the signed transaction on-chain
    const connection = new Connection(RPC_URL, 'confirmed')
    const signature = await connection.sendTransaction(tx)
    console.log(`[DevBuy API] TX sent, awaiting confirmation: ${signature}`)

    await connection.confirmTransaction(signature, 'confirmed')

    console.log(`[DevBuy API] ✅ Devbuy confirmed: ${amount} SOL → ${TOKEN_ADDRESS}`)
    console.log(`[DevBuy API] TX: https://solscan.io/tx/${signature}`)

    return NextResponse.json({
      success: true,
      signature,
      amount,
      tokenAddress: TOKEN_ADDRESS,
    })
  } catch (error: any) {
    console.error('[DevBuy API] Failed:', error?.message || error)
    return NextResponse.json(
      { error: 'Devbuy transaction failed', details: error?.message },
      { status: 500 }
    )
  }
}
