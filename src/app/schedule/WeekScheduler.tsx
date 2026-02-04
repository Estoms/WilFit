'use client'

import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import WorkoutPlanningModal from '@/components/schedule/WorkoutPlanningModal'

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
                <WorkoutPlanningModal
                    date={selectedDate}
                    onClose={() => setIsModalOpen(false)}
                    templates={templates}
                />
            )}
        </div>
    )
}
