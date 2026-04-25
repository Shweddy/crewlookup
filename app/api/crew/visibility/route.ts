import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { crew_id, is_visible } = body

  if (!crew_id?.trim() || typeof is_visible !== 'boolean') {
    return NextResponse.json({ error: 'crew_id and is_visible are required' }, { status: 400 })
  }

  const supabase = getSupabase()

  const { error } = await supabase
    .from('crew')
    .update({ is_visible })
    .eq('crew_id', crew_id.trim())
    .eq('is_registered', true)

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
