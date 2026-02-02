'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const RAPID_API_KEY = process.env.RAPIDAPI_KEY
const RAPID_API_HOST = 'exercisedb.p.rapidapi.com'

type ApiExercise = {
    id: string
    name: string
    bodyPart: string
    gifUrl?: string
    target: string
    equipment: string
}

export async function searchExercises(query: string) {
    if (!query || query.length < 3) return []

    const supabase = await createClient()

    // 1. Search Local DB first
    const { data: localData, error } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10)

    let results: ApiExercise[] = []

    if (localData && localData.length > 0) {
        results = localData.map(ex => ({
            id: ex.id, // UUID
            name: ex.name,
            bodyPart: ex.body_part,
            target: '', // We might not store this locally yet, implies partial data
            equipment: '',
            gifUrl: ex.gif_url || undefined
        }))
    }

    // 2. If we have enough local results (e.g. >= 5), we can skip API to save quota/time.
    // Or we can always fetch API to supplement.
    // Requirement: "Ne pas rappeler l'API 2 fois".
    // Strategy: If we found exact match or good amount of local, return local.
    // Otherwise, fetch API and combine.

    if (results.length >= 5) {
        return results
    }

    // 3. Search API
    const url = `https://exercisedb.p.rapidapi.com/exercises/name/${query}?limit=10`
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPID_API_KEY!,
            'x-rapidapi-host': RAPID_API_HOST
        }
    }

    try {
        const response = await fetch(url, options)
        const apiData = await response.json()

        if (Array.isArray(apiData) && apiData.length > 0) {
            const apiResults = apiData.map((ex: any) => ({
                id: ex.id, // String ID from API
                name: ex.name,
                bodyPart: ex.bodyPart,
                target: ex.target,
                equipment: ex.equipment,
                gifUrl: `/api/exercise-image?id=${ex.id}`
            })) as ApiExercise[]

            // Filter out duplicates (check by name roughly?)
            // Or just append.
            // Ideally avoid showing same exercise twice.
            const existingNames = new Set(results.map(r => r.name.toLowerCase()))
            const newExercises = apiResults.filter(r => !existingNames.has(r.name.toLowerCase()))

            results = [...results, ...newExercises]
        }
    } catch (error) {
        console.error('API Search failed', error)
        // Fallback to just local results
    }

    return results
}

export async function importExercise(apiExercise: ApiExercise) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Check if exists
    const { data: existing } = await supabase
        .from('exercises')
        .select('id')
        .eq('external_api_id', apiExercise.id)
        .single()

    if (existing) {
        return { id: existing.id, isNew: false }
    }

    // Insert
    const { data: newExercise, error } = await supabase
        .from('exercises')
        .insert({
            user_id: user.id,
            external_api_id: apiExercise.id,
            name: apiExercise.name,
            body_part: apiExercise.bodyPart,
            gif_url: apiExercise.gifUrl,
        })
        .select('id')
        .single()

    if (error) {
        return { error: error.message }
    }

    return { id: newExercise.id, isNew: true }
}
