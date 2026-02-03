'use client'

import { useState, useEffect } from 'react'

export default function RestTimer({ initialDuration = 120, isActive, onComplete }: { initialDuration?: number, isActive: boolean, onComplete?: () => void }) {
    const [timeLeft, setTimeLeft] = useState(initialDuration)

    useEffect(() => {
        if (!isActive) {
            if (timeLeft !== initialDuration) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                setTimeLeft(initialDuration)
            }
            return
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, initialDuration])

    useEffect(() => {
        if (!isActive) return

        if (timeLeft <= 0) {
            if (onComplete) onComplete()
            return
        }

        const intervalId = setInterval(() => {
            setTimeLeft((t) => t - 1)
        }, 1000)

        return () => clearInterval(intervalId)
    }, [isActive, timeLeft, onComplete])

    if (!isActive) return null

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    return (
        <div className="fixed bottom-20 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center w-16 h-16 border-2 border-indigo-400">
            <span className="font-bold text-sm">
                {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
        </div>
    )
}
