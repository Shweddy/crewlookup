import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { is_visible } = await request.json()
  if (typeof is_visible !== 'boolean') {
    return NextResponse.json({ error: 'is_visible is required' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { error } = await supabase
    .from('crew')
    .update({ is_visible })
    .eq('line_user_id', session.user.id)
    .eq('is_registered', true)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 200 })
}
