'use client'

import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Plus, Calendar as CalendarIcon, ChevronRight, Layout, Dumbbell } from 'lucide-react'
import Link from 'next/link'
import { createWorkout, startWorkoutFromTemplate } from '@/app/workouts/actions'

export default function WeekScheduler({ workouts, templates }: { workouts: any[], templates: any[] }) {
    const [viewDate, setViewDate] = useState(new Date())
    const start = startOfWeek(viewDate, { weekStartsOn: 1 }) // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i))

    // Simple Modal for adding workout
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'custom' | 'template'>('custom')

    const handleDayClick = (date: Date) => {
        setSelectedDate(date)
        setIsModalOpen(true)
        setActiveTab('custom') // Default to custom
    }

    const getWorkoutsForDay = (date: Date) => {
        return workouts.filter(w => {
            if (!w.scheduled_date) return false
            return isSameDay(new Date(w.scheduled_date), date)
        })
    }

    return (
        <div className="space-y-6">
            {/* Week Grid */}
            <div className="grid grid-cols-1 gap-4">
                {weekDays.map((day) => {
                    const dayWorkouts = getWorkoutsForDay(day)
                    const isToday = isSameDay(day, new Date())

                    return (
                        <div key={day.toISOString()} className={`p-4 rounded-xl border ${isToday ? 'border-indigo-500 bg-indigo-900/10' : 'border-gray-800 bg-gray-900'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-sm text-gray-400 uppercase">{format(day, 'EEEE')}</div>
                                    <div className="text-xl font-bold">{format(day, 'd MMM')}</div>
                                </div>
                                <button onClick={() => handleDayClick(day)} className="p-2 rounded-full hover:bg-gray-800">
                                    <Plus size={20} className="text-indigo-400" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {dayWorkouts.map(w => (
                                    <Link href={`/workouts/${w.id}`} key={w.id} className="block bg-gray-950 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{w.name}</span>
                                            <ChevronRight size={16} className="text-gray-600" />
                                        </div>
                                        <div className="text-xs text-gray-500 capitalize mt-1">{w.status.replace('_', ' ')}</div>
                                    </Link>
                                ))}

                                {dayWorkouts.length === 0 && (
                                    <div className="text-xs text-gray-600 italic">Rest Day</div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Modal for Creating Workout */}
            {isModalOpen && selectedDate && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md border border-gray-800">
                        <h2 className="text-xl font-bold mb-4">Plan Workout</h2>
                        <p className="text-gray-400 mb-6">For {format(selectedDate, 'EEEE d MMM')}</p>

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
                                <input type="hidden" name="scheduledDate" value={selectedDate.toISOString()} />
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
                                        onClick={() => setIsModalOpen(false)}
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
                                            await startWorkoutFromTemplate(t.id, selectedDate.toISOString())
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
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full py-3 rounded-lg bg-gray-800 font-medium text-gray-300 hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
