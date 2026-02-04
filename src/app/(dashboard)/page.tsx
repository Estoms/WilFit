import { createClient } from '@/utils/supabase/server'
import OneRMChart from '@/components/dashboard/OneRMChart'
import LastWorkoutWidget from '@/components/dashboard/LastWorkoutWidget'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell } from 'lucide-react'

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

    // 2. Fetch Weekly Volume
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: weeklyWorkouts } = await supabase
        .from('workouts')
        .select('volume_load')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('end_time', oneWeekAgo.toISOString())

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const weeklyVolume = (weeklyWorkouts as any[])?.reduce((acc: number, curr: any) => acc + (curr.volume_load || 0), 0) || 0

    // 3. Dynamic 1RM Chart (Best Exercise)
    // Find exercise with highest PR to show off
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: bestExercise } = await (supabase
        .from('exercises')
        .select('id, name, current_pr')
        .order('current_pr', { ascending: false, nullsFirst: false })
        .limit(1)
        .single() as any)

    interface ChartData {
        date: string
        oneRM: number
    }
    let chartData: ChartData[] = []
    let chartTitle = 'Estimated 1RM'

    if (bestExercise) {
        chartTitle = `${bestExercise.name} Progress`

        const { data: sets } = await supabase
            .from('sets')
            .select('estimated_1rm, workouts(start_time)')
            .eq('exercise_id', bestExercise.id)
            .order('id', { ascending: true })
            .limit(20) // Limit points for clarity

        if (sets) {
            type SetWithWorkout = { estimated_1rm: number; workouts: { start_time: string } | null }

            // Group by workout/date to avoid noise? Or just take max per day?
            // Simple approach: All sets
            chartData = (sets as unknown as SetWithWorkout[])
                .filter(s => s.workouts && s.workouts.start_time)
                .map(s => ({
                    date: new Date(s.workouts!.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    oneRM: s.estimated_1rm
                }))
        }
    }

    return (
        <div className="space-y-6 pb-24 px-4 pt-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Welcome back!</h1>
                    <p className="text-gray-400">Ready to crush your goals?</p>
                </div>
                <Link href="/profile" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-indigo-400 font-bold border border-gray-700">
                    {user.email?.[0].toUpperCase()}
                </Link>
            </header>

            <LastWorkoutWidget workout={lastWorkout} />

            {/* Weekly Volume Widget */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Weekly Volume</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white max-sm:text-3xl">
                            {(weeklyVolume / 1000).toFixed(1)}k
                        </span>
                        <span className="text-sm text-gray-500 font-medium">kg moved</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Last 7 days</p>
                </div>
                <div className="absolute right-0 bottom-0 p-4 opacity-10">
                    <Dumbbell size={80} />
                </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    {chartTitle}
                </h3>
                {chartData.length > 0 ? (
                    <OneRMChart data={chartData} />
                ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500 text-sm border-2 border-dashed border-gray-800 rounded-lg">
                        Start lifting to see your progress!
                    </div>
                )}
            </div>
        </div>
    )
}
