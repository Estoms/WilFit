import { createWorkout, getTemplates, deleteTemplate, startWorkoutFromTemplate } from '../actions'
import { Plus, Trash2, Play } from 'lucide-react'

export default async function NewWorkoutPage() {
    const templates = await getTemplates()

    return (
        <div className="p-6 min-h-screen bg-gray-950 text-white pb-24">
            <h1 className="text-3xl font-bold mb-8">New Session</h1>

            {/* Quick Start */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-400">Quick Start</h2>
                <form action={createWorkout} className="bg-gray-900 p-5 rounded-2xl border border-gray-800 flex flex-col gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-500 mb-1">Session Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. Empty Workout"
                            className="block w-full rounded-lg bg-gray-950 border-gray-800 text-white focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-white text-black py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        Start Empty Workout
                    </button>
                </form>
            </section>

            {/* Templates */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-400">My Routines</h2>

                {templates.length === 0 ? (
                    <div className="text-center py-8 bg-gray-900/50 rounded-2xl border border-dashed border-gray-800 text-gray-500">
                        <p>No routines yet.</p>
                        <p className="text-sm mt-2">Save a workout as a routine to see it here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((template: any) => (
                            <div key={template.id} className="bg-gray-900 p-5 rounded-2xl border border-gray-800 flex justify-between items-center group hover:border-indigo-500/50 transition-colors">
                                <div>
                                    <h3 className="font-bold text-lg">{template.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Created {new Date(template.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <form action={async () => {
                                        'use server'
                                        await deleteTemplate(template.id)
                                    }}>
                                        <button className="p-2 text-gray-600 hover:text-red-500 transition-colors" title="Delete">
                                            <Trash2 size={20} />
                                        </button>
                                    </form>

                                    <form action={async () => {
                                        'use server'
                                        await startWorkoutFromTemplate(template.id)
                                    }}>
                                        <button className="bg-indigo-600 p-3 rounded-full text-white shadow-lg hover:bg-indigo-500 hover:scale-105 transition-all">
                                            <Play size={20} fill="currentColor" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
