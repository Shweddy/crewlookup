import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, line_link } = await request.json()

  if (!name?.trim() && !line_link?.trim()) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  if (line_link && !line_link.startsWith('https://line.me/')) {
    return NextResponse.json({ error: 'Invalid LINE link format' }, { status: 400 })
  }

  const updates: Record<string, string> = {}
  if (name?.trim()) updates.name = name.trim()
  if (line_link?.trim()) updates.line_link = line_link.trim()

  const supabase = getSupabase()
  const { error } = await supabase
    .from('crew')
    .update(updates)
    .eq('line_user_id', session.user.id)
    .eq('is_registered', true)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
