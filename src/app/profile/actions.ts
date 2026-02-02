'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const username = formData.get('username') as string
    const body_weight = parseFloat(formData.get('body_weight') as string)
    const preferred_unit = formData.get('preferred_unit') as 'kg' | 'lbs'

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            username,
            body_weight,
            preferred_unit,
            updated_at: new Date().toISOString(),
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
}
