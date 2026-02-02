'use client'

import { Loader2, Plus, Dumbbell, Check, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

interface Exercise {
    id: string
    name: string
    bodyPart: string
    gifUrl?: string | null
    // Add other fields if necessary
}

interface ExerciseCardProps {
    exercise: Exercise
    onImport?: (exercise: Exercise) => void
    importing?: boolean
    isAdded?: boolean
}

export default function ExerciseCard({ exercise, onImport, importing, isAdded }: ExerciseCardProps) {
    const [isZoomed, setIsZoomed] = useState(false)

    return (
        <>
            <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl flex gap-4 items-center shadow-sm hover:border-gray-700 transition-colors group">
                {exercise.gifUrl ? (
                    <div
                        className="relative w-24 h-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-md bg-gray-800"
                        onClick={() => setIsZoomed(true)}
                    >
                        <img
                            src={exercise.gifUrl}
                            alt={exercise.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLElement).parentElement?.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                ) : null}

                <div className={`w-24 h-24 rounded-md bg-gray-800 flex flex-shrink-0 items-center justify-center text-gray-600 ${exercise.gifUrl ? 'hidden' : ''}`}>
                    <Dumbbell size={32} />
                </div>

                <div className="flex-1 min-w-0 py-2">
                    <h3 className="font-bold text-lg truncate capitalize text-gray-100">{exercise.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 capitalize border border-gray-700">
                            {exercise.bodyPart}
                        </span>
                    </div>
                </div>

                {onImport && (
                    <button
                        onClick={() => onImport(exercise)}
                        disabled={importing || isAdded}
                        className={`p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 flex-shrink-0 ${isAdded
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                : 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-600/20'
                            }`}
                    >
                        {importing ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : isAdded ? (
                            <Check size={24} />
                        ) : (
                            <Plus size={24} />
                        )}
                    </button>
                )}
            </div>

            {/* Lightbox / Zoom View */}
            {isZoomed && exercise.gifUrl && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setIsZoomed(false)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
                        onClick={() => setIsZoomed(false)}
                    >
                        <X size={32} />
                    </button>
                    <div
                        className="relative w-full max-w-2xl aspect-square sm:aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={exercise.gifUrl}
                            alt={exercise.name}
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                            <h3 className="text-xl font-bold text-white capitalize text-center">{exercise.name}</h3>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
