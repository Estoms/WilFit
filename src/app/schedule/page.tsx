import { createClient } from '@/utils/supabase/server'
import WeekScheduler from './WeekScheduler'
import { redirect } from 'next/navigation'

export default async function SchedulePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch workouts for the current week? Or all planned?
    // Let's fetch all 'planned' workouts and recent 'completed' ones.
    const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .order('scheduled_date', { ascending: true })

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 pb-24">
            <h1 className="text-2xl font-bold mb-6">Weekly Schedule</h1>
            <WeekScheduler workouts={workouts || []} />
        </div>
    )
}
