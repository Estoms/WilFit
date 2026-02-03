'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitOnboarding(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const username = formData.get('username') as string
    const body_weight = parseFloat(formData.get('body_weight') as string)
    const preferred_unit = formData.get('preferred_unit') as 'kg' | 'lbs'

    const query = supabase.from('profiles') as any
    const { error } = await query
        .upsert({
            id: user.id,
            username,
            body_weight,
            preferred_unit,
            updated_at: new Date().toISOString()
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
