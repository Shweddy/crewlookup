import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const crew_id = searchParams.get('crew_id')?.trim()

  if (!crew_id) {
    return NextResponse.json({ error: 'crew_id is required' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('crew')
    .select('crew_id, name, position, line_link')
    .eq('crew_id', crew_id)
    .eq('is_registered', true)
    .eq('is_visible', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ found: false }, { status: 200 })
  }

  return NextResponse.json({ found: true, crew: data }, { status: 200 })
}
