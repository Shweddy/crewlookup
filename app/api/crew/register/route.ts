import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { crew_id, name, line_link, is_visible } = body

  if (!crew_id?.trim() || !name?.trim() || !line_link?.trim()) {
    return NextResponse.json({ error: 'crew_id, name, and line_link are required' }, { status: 400 })
  }

  if (!line_link.startsWith('https://line.me/')) {
    return NextResponse.json({ error: 'Invalid LINE link format' }, { status: 400 })
  }

  const supabase = getSupabase()

  const { data: existing } = await supabase
    .from('crew')
    .select('id')
    .eq('crew_id', crew_id.trim())
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Crew ID already registered' }, { status: 409 })
  }

  const { error } = await supabase.from('crew').insert({
    crew_id: crew_id.trim(),
    name: name.trim(),
    line_link: line_link.trim(),
    is_registered: true,
    is_visible: is_visible ?? true,
  })

  if (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
