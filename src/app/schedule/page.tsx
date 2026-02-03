import { createClient } from '@/utils/supabase/server'
import WeekScheduler from './WeekScheduler'
import { redirect } from 'next/navigation'
import { getTemplates } from '../workouts/actions'

export default async function SchedulePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch workouts
    const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .order('scheduled_date', { ascending: true })

    // Fetch templates
    const templates = await getTemplates()

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 pb-24">
            <h1 className="text-2xl font-bold mb-6">Weekly Schedule</h1>
            <WeekScheduler workouts={workouts || []} templates={templates || []} />
        </div>
    )
}
