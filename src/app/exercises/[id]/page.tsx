import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ExerciseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()

    const { id } = await params

    const { data: exercise } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single()

    if (!exercise) {
        return <div className="p-6">Exercise not found</div>
    }

    // Fetch PR History? Or just show current PR?
    // Schema has `current_pr` in `exercises` table.
    // To show proper history, we'd query `sets` with this exercise_id ordered by weight/date.
    // But for now, let's show the main info.

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 pb-24">
            <h1 className="text-3xl font-bold capitalize mb-2">{exercise.name}</h1>
            <p className="text-gray-400 capitalize mb-6">{exercise.body_part}</p>

            <div className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800 mb-8">
                {exercise.gif_url ? (
                    <img src={exercise.gif_url} alt={exercise.name} className="w-full object-cover" />
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">No GIF available</div>
                )}
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-4">Personal Record</h2>
                <div className="text-4xl font-bold text-indigo-500">
                    {exercise.current_pr ? `${exercise.current_pr} kg` : '--'}
                </div>
                <p className="text-sm text-gray-400 mt-2">Theoretical 1RM</p>
            </div>

            {/* Todo: Graph of history? */}
        </div>
    )
}
