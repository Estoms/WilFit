import { createClient } from '@/utils/supabase/server'
import OneRMChart from '@/components/dashboard/OneRMChart'
import LastWorkoutWidget from '@/components/dashboard/LastWorkoutWidget'

import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // 1. Fetch Last Workout
    const { data: lastWorkout } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('end_time', { ascending: false })
        .limit(1)
        .single()

    // 2. Fetch Chart Data (Bench Press History)
    // Find 'Bench Press' or similar
    const { data: benchExercise } = await supabase
        .from('exercises')
        .select('id')
        .ilike('name', '%Bench Press%') // Simple matching
        .limit(1)
        .single()

    let chartData: any[] = []

    if (benchExercise) {
        const { data: sets } = await supabase
            .from('sets')
            .select('estimated_1rm, workouts(start_time)')
            .eq('exercise_id', (benchExercise as any).id)
            .order('id', { ascending: true }) // Chronological

        // Transform
        if (sets) {
            chartData = sets
                .filter((s: any) => s.workouts) // Ensure workout exists
                .map((s: any) => ({
                    date: new Date(s.workouts.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    oneRM: s.estimated_1rm
                }))
        }
    }

    // 3. Weekly Volume Load
    // Calculate specific fatigue metrics? Simplified: show total volume load of this week
    // ... (Skipping complex date logic for brevity, just showing placeholder widget)

    return (
        <div className="space-y-6 pb-20">
            <header>
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-gray-400">Ready to crush your goals?</p>
            </header>

            <LastWorkoutWidget workout={lastWorkout} />

            <OneRMChart data={chartData} />

            {/* Fatigue / Volume Widget */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-semibold mb-2">Weekly Volume</h3>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-green-400">--</span>
                    <span className="text-sm text-gray-500 mb-1">kg moved</span>
                </div>
            </div>
        </div>
    )
}
