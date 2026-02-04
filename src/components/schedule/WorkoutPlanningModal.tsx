'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Layout, Dumbbell } from 'lucide-react'
import { createWorkout, startWorkoutFromTemplate } from '@/app/workouts/actions'

interface Props {
    date: Date
    onClose: () => void
    templates: any[]
}

export default function WorkoutPlanningModal({ date, onClose, templates }: Props) {
    const [activeTab, setActiveTab] = useState<'custom' | 'template'>('custom')

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md border border-gray-800">
                <h2 className="text-xl font-bold mb-4">Plan Workout</h2>
                <p className="text-gray-400 mb-6">For {format(date, 'EEEE d MMM')}</p>

                {/* Tabs */}
                <div className="flex bg-gray-950 rounded-lg p-1 mb-6 border border-gray-800">
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'custom' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Dumbbell size={16} />
                        Empty
                    </button>
                    <button
                        onClick={() => setActiveTab('template')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'template' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Layout size={16} />
                        Routine
                    </button>
                </div>

                {activeTab === 'custom' ? (
                    <form action={async (formData) => {
                        await createWorkout(formData)
                    }} className="space-y-4">
                        <input type="hidden" name="scheduledDate" value={date.toISOString()} />
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Workout Name</label>
                            <input
                                name="name"
                                type="text"
                                placeholder="e.g., Leg Day"
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-lg bg-gray-800 font-medium text-gray-300 hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 rounded-lg bg-indigo-600 font-medium hover:bg-indigo-500"
                            >
                                Create Plan
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                        {templates.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 bg-gray-950 rounded-xl border border-dashed border-gray-800">
                                No routines found.
                            </div>
                        ) : (
                            templates.map(t => (
                                <form key={t.id} action={async () => {
                                    await startWorkoutFromTemplate(t.id, date.toISOString())
                                }}>
                                    <button
                                        type="submit"
                                        className="w-full text-left bg-gray-950 border border-gray-800 p-4 rounded-xl hover:border-indigo-500 transition-colors flex items-center justify-between group"
                                    >
                                        <span className="font-semibold">{t.name}</span>
                                        <Plus size={20} className="text-gray-600 group-hover:text-indigo-400" />
                                    </button>
                                </form>
                            ))
                        )}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-3 rounded-lg bg-gray-800 font-medium text-gray-300 hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
