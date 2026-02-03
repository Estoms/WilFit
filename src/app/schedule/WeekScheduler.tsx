'use client'

import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Plus, Calendar as CalendarIcon, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { createWorkout } from '@/app/workouts/actions' // We might need a client-friendly way or form

export default function WeekScheduler({ workouts }: { workouts: any[] }) {
    const [viewDate, setViewDate] = useState(new Date())
    const start = startOfWeek(viewDate, { weekStartsOn: 1 }) // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i))

    // Simple Modal for adding workout
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleDayClick = (date: Date) => {
        setSelectedDate(date)
        setIsModalOpen(true)
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
                        <p className="text-gray-400 mb-4">For {format(selectedDate, 'EEEE d MMM')}</p>

                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <form action={createWorkout as any} className="space-y-4">
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
                                    className="flex-1 py-3 rounded-lg bg-gray-800 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-lg bg-indigo-600 font-medium"
                                >
                                    Create Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
