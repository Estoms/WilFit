'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, CheckCircle, Timer, Dumbbell, Save } from 'lucide-react'
import SetInput from '@/components/workout/SetInput'
import RestTimer from '@/components/workout/RestTimer'
import { addSet, finishWorkout, startWorkout, saveWorkoutAsTemplate } from '@/app/workouts/actions'

type Props = {
    workout: any
    exercises: any[]
}

export default function WorkoutSession({ workout, exercises }: Props) {
    const [timerActive, setTimerActive] = useState(false)
    const [timerKey, setTimerKey] = useState(0) // Force reset

    const handleSetComplete = async () => {
        setTimerKey(k => k + 1)
        setTimerActive(true)
    }

    const handleFinish = async () => {
        await finishWorkout(workout.id)
    }
    // ...
    const handleStart = async () => {
        await startWorkout(workout.id)
    }

    return (
        <div className="pb-32">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{workout.name}</h1>
                    <span className="text-sm text-gray-400 capitalize">
                        {workout.status === 'planned' && workout.scheduled_date
                            ? `Planned: ${new Date(workout.scheduled_date).toLocaleDateString()}`
                            : workout.status.replace('_', ' ')
                        }
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            const name = prompt('Routine Name:', workout.name)
                            if (name) {
                                await saveWorkoutAsTemplate(workout.id, name)
                                alert('Routine saved!')
                            }
                        }}
                        className="p-2 text-gray-400 hover:text-white"
                        title="Save as Routine"
                    >
                        <Save size={20} />
                    </button>

                    {workout.status === 'planned' ? (
                        <button onClick={handleStart} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-bold animate-pulse">
                            Start Workout
                        </button>
                    ) : workout.status === 'in_progress' ? (
                        <button onClick={handleFinish} className="bg-red-600/20 text-red-500 px-3 py-1 rounded-md text-sm font-medium">
                            Finish
                        </button>
                    ) : (
                        <div className="text-green-500 font-bold">Completed</div>
                    )}
                </div>
            </header>

            {/* List of Exercises in this Workout */}
            <div className="space-y-6">
                {exercises.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No exercises added yet.
                    </div>
                )}

                {exercises.map((group: any) => (
                    <div key={group.exercise.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                            {group.exercise.gif_url ? (
                                <img src={group.exercise.gif_url} className="w-12 h-12 rounded bg-gray-800 object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center text-gray-500">
                                    <Dumbbell size={20} />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold">{group.exercise.name}</h3>
                                <div className="text-xs text-indigo-400">PR: {group.exercise.current_pr || '--'} kg</div>
                            </div>
                        </div>

                        {/* Existing Sets */}
                        <div className="space-y-2 mb-3">
                            <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 text-center mb-1">
                                <div>KG</div>
                                <div>REPS</div>
                                <div>Effort</div>
                                <div>Status</div>
                            </div>
                            {group.sets.map((set: any, idx: number) => (
                                <div key={set.id} className="grid grid-cols-4 gap-2 items-center bg-gray-950 p-2 rounded text-sm text-center">
                                    <div className="text-white">{set.weight}</div>
                                    <div className="text-white">{set.reps}</div>
                                    <div className="text-gray-400">{set.rpe || '-'}</div>
                                    <div className="flex justify-center text-green-500"><CheckCircle size={16} /></div>
                                </div>
                            ))}
                        </div>

                        {/* Input for New Set */}
                        <div className="mt-4 pt-4 border-t border-gray-800">
                            <div className="text-xs text-gray-500 mb-2">New Set</div>
                            <SetInput onSave={async (data) => {
                                await addSet(workout.id, group.exercise.id, data)
                                handleSetComplete()
                            }} />
                        </div>
                    </div>
                ))}

                {/* Add Exercise Button */}
                <Link href={`/exercises?workoutId=${workout.id}`} className="block w-full py-4 rounded-xl border-2 border-dashed border-gray-800 text-gray-500 text-center hover:border-gray-700 hover:text-gray-300 transition-colors">
                    <Plus className="inline mr-2" />
                    Add Exercise
                </Link>
            </div>

            <RestTimer
                key={timerKey}
                isActive={timerActive}
                onComplete={() => setTimerActive(false)}
            />
        </div>
    )
}
