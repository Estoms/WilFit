import Link from 'next/link'
import { Calendar, Timer, Dumbbell } from 'lucide-react'

export default function LastWorkoutWidget({ workout }: { workout: any }) {
    if (!workout) {
        return (
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-semibold mb-2">Last Workout</h3>
                <div className="text-gray-400 text-sm">No recent workouts found.</div>
                <Link href="/workouts/new" className="mt-4 block w-full text-center bg-indigo-600/20 text-indigo-400 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600/30">
                    Start First Workout
                </Link>
            </div>
        )
    }

    const date = new Date(workout.end_time || workout.start_time).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

    return (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Last Session</h3>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-xl font-bold text-indigo-400">{workout.name}</div>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Calendar size={12} className="mr-1" />
                        {date}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-white">{Math.round(workout.volume_load || 0)}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Vol. Load</div>
                </div>
            </div>

            <Link href={`/workouts/${workout.id}`} className="block w-full text-center bg-gray-800 text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                View Details
            </Link>
        </div>
    )
}
