import { createWorkout } from '../actions'

export default function NewWorkoutPage() {
    return (
        <div className="p-6 min-h-screen bg-gray-950 text-white flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-6 text-center">Start Workout</h1>

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <form action={createWorkout as any} className="max-w-sm mx-auto w-full space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400">Workout Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="Leg Day A"
                        className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 py-3 rounded-lg font-bold text-lg hover:bg-indigo-500 transition-colors"
                >
                    Start Session
                </button>
            </form>
        </div>
    )
}
