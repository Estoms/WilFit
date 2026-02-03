import { createClient } from '@/utils/supabase/server'
import WorkoutSession from './WorkoutSession'
import { redirect } from 'next/navigation'

export default async function WorkoutPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Await params and searchParams
    const { id } = await params
    const resolvedSearchParams = await searchParams

    if (!user) redirect('/login')

    // Fetch workout
    const { data: workout } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single()

    if (!workout) {
        return <div>Workout not found</div>
    }

    // Fetch sets
    const { data: sets } = await supabase
        .from('sets')
        .select('*, exercise:exercises(*)')
        .eq('workout_id', id)
        .order('id', { ascending: true })

    // Fetch planned exercises (Module 6)
    const { data: plannedExercises } = await supabase
        .from('workout_exercises')
        .select('*, exercise:exercises(*)')
        .eq('workout_id', id)

    // Handle newExercise param (Transient -> Persistent Plan)
    const newExerciseId = resolvedSearchParams?.newExercise
    if (newExerciseId && typeof newExerciseId === 'string') {
        // Check if already in plan or sets (Sets also imply existence)
        const inPlan = plannedExercises?.some((p: any) => p.exercise.id === newExerciseId)
        const inSets = sets?.some((s: any) => s.exercise.id === newExerciseId)

        if (!inPlan && !inSets) {
            // Add to Plan
            const query = supabase.from('workout_exercises') as any
            await query.insert({
                workout_id: id,
                exercise_id: newExerciseId
            })
            // Refresh to show it
            redirect(`/workouts/${id}`)
        }
    }

    // Merge logic: We want to show all exercises that are either in the Plan OR have Sets.
    // Group sets by exercise
    const exercisesMap = new Map()

    // 1. Add Planned Exercises first
    if (plannedExercises) {
        plannedExercises.forEach((item: any) => {
            if (!exercisesMap.has(item.exercise.id)) {
                exercisesMap.set(item.exercise.id, {
                    exercise: item.exercise,
                    sets: [],
                    isPlanned: true
                })
            }
        })
    }

    // 2. Add Sets (and exercises if not in plan)
    if (sets) {
        sets.forEach((set: any) => {
            if (!exercisesMap.has(set.exercise.id)) {
                exercisesMap.set(set.exercise.id, {
                    exercise: set.exercise,
                    sets: [],
                    isPlanned: false // Was not in plan table, but has sets
                })
            }
            exercisesMap.get(set.exercise.id).sets.push(set)
        })
    }

    const exercises = Array.from(exercisesMap.values())

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4">
            <WorkoutSession workout={workout} exercises={exercises} />
        </div>
    )
}
