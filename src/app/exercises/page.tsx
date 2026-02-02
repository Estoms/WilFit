'use client'

import { useState } from 'react'
import { searchExercises, importExercise } from './actions'
import { Loader2 } from 'lucide-react'
import ExerciseCard from '@/components/exercises/ExerciseCard'
import { useRouter } from 'next/navigation'

export default function ExercisesPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [importing, setImporting] = useState<string | null>(null)

    const router = useRouter()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query) return
        setLoading(true)
        const data = await searchExercises(query)
        setResults(data || [])
        setLoading(false)
    }

    const handleImport = async (exercise: any) => {
        setImporting(exercise.id)
        try {
            const res = await importExercise(exercise)
            // console.log('Import result:', res)

            if (res.error) {
                alert(`Error importing exercise: ${res.error}`)
                setImporting(null)
                return
            }

            // Check for workoutId in URL
            const params = new URLSearchParams(window.location.search)
            const workoutId = params.get('workoutId')

            if (workoutId && res.id) {
                // Keep loading state while redirecting
                router.push(`/workouts/${workoutId}?newExercise=${res.id}`)
            } else {
                setImporting(null)
                // Optional: Toast success if not redirecting
                alert("Exercise added to library!")
            }
        } catch (error) {
            console.error("Import failed", error)
            alert("Failed to import exercise.")
            setImporting(null)
        }
    }

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">Exercise Library</h1>

            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search exercises (e.g., Bench Press)"
                    className="flex-1 rounded-md bg-gray-800 border-gray-700 text-white px-4 py-2"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 px-4 py-2 rounded-md font-medium disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Search'}
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((ex) => (
                    <ExerciseCard
                        key={ex.id}
                        exercise={ex}
                        onImport={handleImport}
                        importing={importing === ex.id}
                    // Simple check if it's already "local" (UUID vs Numeric string) to show as "Saved"?
                    // Actually, searchExercises mixes them.
                    // If it came from Local DB, we could imply it's added.
                    // But for now, let's keep simple.
                    />
                ))}
            </div>
        </div>
    )
}
