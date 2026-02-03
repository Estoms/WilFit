'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createWorkout(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const scheduledDate = formData.get('scheduledDate') as string

    // If a date is provided, it's a PLANNED workout. Otherwise, start immediately.
    const status: 'planned' | 'in_progress' = scheduledDate ? 'planned' : 'in_progress'
    const startTime = scheduledDate ? null : new Date().toISOString()

    const query = supabase.from('workouts') as any
    const { data, error } = await query
        .insert({
            user_id: user.id,
            name,
            status,
            start_time: startTime,
            scheduled_date: scheduledDate || null
        })
        .select('id')
        .single()

    if (error) return { error: error.message }

    redirect(`/workouts/${data.id}`)
}

export async function startWorkout(workoutId: string) {
    const supabase = await createClient()

    const query = supabase.from('workouts') as any
    const { error } = await query
        .update({
            status: 'in_progress',
            start_time: new Date().toISOString()
        })
        .eq('id', workoutId)

    if (error) return { error: error.message }

    revalidatePath(`/workouts/${workoutId}`)
    return { success: true }
}

export async function addExerciseToPlan(workoutId: string, exerciseId: string) {
    const supabase = await createClient()

    // Check if already in plan? (Optional, but good UX)
    // For now, just insert
    const query = supabase.from('workout_exercises') as any
    const { error } = await query
        .insert({
            workout_id: workoutId,
            exercise_id: exerciseId
        })

    if (error) return { error: error.message }

    // Redirect? No, likely called from exercise page or workout page
    // revalidatePath?
    return { success: true }
}

export async function addSet(workoutId: string, exerciseId: string, set: any) {
    // set contains: reps, weight, rpe, estimated_1rm
    const supabase = await createClient()

    // 1. Insert Set
    const query = supabase.from('sets') as any
    const { data: newSet, error } = await query
        .insert({
            workout_id: workoutId,
            exercise_id: exerciseId,
            reps: set.reps,
            weight: set.weight,
            rpe: set.rpe,
            estimated_1rm: set.estimated_1rm
        })
        .select()
        .single()

    if (error) return { error: error.message }

    // 2. Check and Update PR (Feature B)
    // Fetch current PR
    const query_ex = supabase.from('exercises') as any
    const { data: exercise } = await query_ex
        .select('current_pr')
        .eq('id', exerciseId)
        .single()

    if (exercise) {
        if (!exercise.current_pr || set.estimated_1rm > exercise.current_pr) {
            // Update PR
            const query = supabase.from('exercises') as any
            await query
                .update({ current_pr: set.estimated_1rm })
                .eq('id', exerciseId)
        }
    }

    revalidatePath(`/workouts/${workoutId}`)
    return { success: true }
}

export async function finishWorkout(workoutId: string) {
    const supabase = await createClient()

    // allow calc volume load (sum of all sets)
    const query_sets = supabase.from('sets') as any
    const { data: sets } = await query_sets
        .select('reps, weight')
        .eq('workout_id', workoutId)

    let volumeLoad = 0
    sets?.forEach((s: any) => {
        volumeLoad += (s.reps * s.weight)
    })

    const query = supabase.from('workouts') as any
    const { error } = await query
        .update({
            status: 'completed',
            end_time: new Date().toISOString(),
            volume_load: volumeLoad
        })
        .eq('id', workoutId)

    if (error) return { error: error.message }

    redirect('/')
}
