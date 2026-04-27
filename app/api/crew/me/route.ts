import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('crew')
    .select('crew_id, name, line_link, is_visible')
    .eq('line_user_id', session.user.id)
    .eq('is_registered', true)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ registered: false }, { status: 200 })
  return NextResponse.json({ registered: true, crew: data }, { status: 200 })
}
