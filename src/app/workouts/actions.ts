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

// --- Templates ---

export async function getTemplates() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('workout_templates')
        .select('*')
        .order('created_at', { ascending: false })

    return data || []
}

export async function saveWorkoutAsTemplate(workoutId: string, name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Create Template
    const { data: template, error: tmplError } = await supabase
        .from('workout_templates')
        .insert({
            user_id: user.id,
            name
        })
        .select('id')
        .single()

    if (tmplError) return { error: tmplError.message }

    // 2. Get Workout Exercises
    const { data: exercises } = await supabase
        .from('workout_exercises')
        .select('exercise_id, created_at') // use created_at for order proxy
        .eq('workout_id', workoutId)
        .order('created_at', { ascending: true })

    if (exercises && exercises.length > 0) {
        const templateExercises = exercises.map((ex, idx) => ({
            template_id: template.id,
            exercise_id: ex.exercise_id,
            order: idx
        }))

        const { error: exError } = await supabase
            .from('template_exercises')
            .insert(templateExercises)

        if (exError) return { error: exError.message }
    }

    revalidatePath('/workouts/new')
    return { success: true }
}

export async function deleteTemplate(templateId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', templateId)

    if (error) return { error: error.message }
    revalidatePath('/workouts/new')
    return { success: true }
}

export async function startWorkoutFromTemplate(templateId: string, scheduledDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Get Template Details
    const { data: template } = await supabase
        .from('workout_templates')
        .select('name')
        .eq('id', templateId)
        .single()

    if (!template) return { error: 'Template not found' }

    // 2. Create Workout
    const status = scheduledDate ? 'planned' : 'in_progress'
    const startTime = scheduledDate ? null : new Date().toISOString()

    const { data: workout, error: wError } = await supabase
        .from('workouts')
        .insert({
            user_id: user.id,
            name: template.name,
            status,
            start_time: startTime,
            scheduled_date: scheduledDate || null
        })
        .select('id')
        .single()

    if (wError) return { error: wError.message }

    // 3. Copy Exercises
    const { data: tmplExercises } = await supabase
        .from('template_exercises')
        .select('exercise_id')
        .eq('template_id', templateId)
        .order('order', { ascending: true })

    if (tmplExercises && tmplExercises.length > 0) {
        const workoutExercises = tmplExercises.map(te => ({
            workout_id: workout.id,
            exercise_id: te.exercise_id
        }))

        await supabase
            .from('workout_exercises')
            .insert(workoutExercises)
    }

    // Return the ID instead of redirecting if called from client with intention to stay?
    // But for now, let's redirect to the workout page (even if planned)
    redirect(`/workouts/${workout.id}`)
}
