'use client'

import { useState, useMemo } from 'react'
import { Check } from 'lucide-react'

// Brzycki Formula
function calculate1RM(weight: number, reps: number) {
    if (reps === 0) return 0
    return weight / (1.0278 - (0.0278 * reps))
}

interface SetData {
    weight: number
    reps: number
    rpe: number | null
    estimated_1rm: number
}

export default function SetInput({ onSave }: { onSave: (data: SetData) => Promise<void> }) {
    const [weight, setWeight] = useState<string>('')
    const [reps, setReps] = useState<string>('')
    const [rpe, setRpe] = useState<string>('')
    const [saved, setSaved] = useState(false)
    const [loading, setLoading] = useState(false)

    const estimated1RM = useMemo(() => {
        const w = parseFloat(weight)
        const r = parseInt(reps)
        if (!w || !r) return 0
        return calculate1RM(w, r).toFixed(1)
    }, [weight, reps])

    const handleSave = async () => {
        if (!weight || !reps) return
        setLoading(true)
        await onSave({
            weight: parseFloat(weight),
            reps: parseInt(reps),
            rpe: parseFloat(rpe) || null,
            estimated_1rm: parseFloat(estimated1RM as string)
        })
        setSaved(true)
        setLoading(false)
    }

    if (saved) {
        return (
            <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-800 rounded-md text-green-400">
                <span>{weight}kg x {reps}</span>
                <Check size={20} />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-4 gap-2 items-center bg-gray-900 p-2 rounded-md border border-gray-800">
            <div>
                <input
                    type="number"
                    placeholder="kg"
                    min="0"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-transparent text-center border-b border-gray-700 focus:border-indigo-500 outline-none text-white appearance-none"
                />
            </div>
            <div>
                <input
                    type="number"
                    placeholder="reps"
                    min="1"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full bg-transparent text-center border-b border-gray-700 focus:border-indigo-500 outline-none text-white appearance-none"
                />
            </div>
            <div>
                <input
                    type="number"
                    placeholder="Effort"
                    min="1"
                    max="10"
                    value={rpe}
                    onChange={(e) => setRpe(e.target.value)}
                    className="w-full bg-transparent text-center border-b border-gray-700 focus:border-indigo-500 outline-none text-white text-sm appearance-none"
                />
            </div>
            <div>
                <button
                    onClick={handleSave}
                    disabled={loading || !weight || !reps}
                    className="w-full bg-indigo-600 rounded-md p-2 flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? '...' : <Check size={16} />}
                </button>
            </div>
            {/* 1RM Preview */}
            <div className="col-span-4 text-xs text-gray-500 text-center mt-1">
                Est. 1RM: <span className="text-indigo-400">{estimated1RM}kg</span>
            </div>
        </div>
    )
}
