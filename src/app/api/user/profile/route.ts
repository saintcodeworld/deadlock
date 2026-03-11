import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// GET — fetch username by clientId
export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId')
    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — create or update username
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientId, username } = body

    if (!clientId || !username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Missing clientId or username' }, { status: 400 })
    }

    const trimmed = username.trim()
    if (trimmed.length < 2 || trimmed.length > 20) {
      return NextResponse.json({ error: 'Username must be 2-20 characters' }, { status: 400 })
    }

    // Check if username is already taken by someone else
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('client_id')
      .eq('username', trimmed)
      .maybeSingle()

    if (existing && existing.client_id !== clientId) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    // Upsert: create or update
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          client_id: clientId,
          username: trimmed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
