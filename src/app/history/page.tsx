import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'
import { Calendar, ChevronRight, Dumbbell } from 'lucide-react'

export default async function HistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please login</div>

    const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('end_time', { ascending: false })

    return (
        <div className="p-4 pb-24 min-h-screen bg-gray-950 text-white">
            <h1 className="text-2xl font-bold mb-6">History</h1>

            {(!workouts || workouts.length === 0) ? (
                <div className="text-center py-10 text-gray-500">
                    No completed workouts yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {workouts.map((workout: any) => (
                        <Link
                            key={workout.id}
                            href={`/workouts/${workout.id}`} // Or maybe a summary page? Default to session view for now but it might look like 'in progress' if not careful.
                            // Actually, let's just show summary here for now or link to same page which handles status 'completed'
                            className="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">{workout.name}</h3>
                                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                                    Done
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>
                                        {workout.end_time
                                            ? format(new Date(workout.end_time), 'PPP')
                                            : 'Unknown Date'}
                                    </span>
                                </div>
                                {workout.volume_load > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Dumbbell size={14} />
                                        <span>{(workout.volume_load / 1000).toFixed(1)}k kg</span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
