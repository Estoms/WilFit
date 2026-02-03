import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { submitOnboarding } from './onboarding.actions'
import { Dumbbell } from 'lucide-react'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-6 border-4 border-gray-900">
                        <Dumbbell size={32} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome to WilFit!</h2>
                    <p className="mt-2 text-gray-400">Let's set up your profile to personalize your experience.</p>
                </div>

                <form action={submitOnboarding as any} className="mt-8 space-y-6 bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl">
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                                Choose a Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="mt-2 block w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                placeholder="e.g. IronLifter"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="body_weight" className="block text-sm font-medium text-gray-300">
                                    Body Weight
                                </label>
                                <input
                                    id="body_weight"
                                    name="body_weight"
                                    type="number"
                                    step="0.1"
                                    required
                                    className="mt-2 block w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label htmlFor="preferred_unit" className="block text-sm font-medium text-gray-300">
                                    Unit
                                </label>
                                <div className="mt-2 grid grid-cols-2 gap-2 bg-gray-950 p-1 rounded-lg border border-gray-800">
                                    <label className="cursor-pointer">
                                        <input type="radio" name="preferred_unit" value="kg" className="peer sr-only" defaultChecked />
                                        <div className="text-center py-2 rounded-md text-sm font-medium text-gray-400 peer-checked:bg-indigo-600 peer-checked:text-white transition-all">
                                            KG
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input type="radio" name="preferred_unit" value="lbs" className="peer sr-only" />
                                        <div className="text-center py-2 rounded-md text-sm font-medium text-gray-400 peer-checked:bg-indigo-600 peer-checked:text-white transition-all">
                                            LBS
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02]"
                    >
                        Get Started
                    </button>
                </form>
            </div>
        </div>
    )
}
