import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from './actions'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const profile = profileData as any

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold mb-6">Profile</h1>

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <form action={updateProfile as any} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                            Email
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                disabled
                                value={user.email}
                                className="block w-full rounded-md bg-gray-800 border-gray-700 text-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-200">
                            Username
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="username"
                                id="username"
                                defaultValue={profile?.username || ''}
                                className="block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="body_weight" className="block text-sm font-medium text-gray-200">
                            Body Weight
                        </label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="number"
                                step="0.1"
                                name="body_weight"
                                id="body_weight"
                                defaultValue={profile?.body_weight || ''}
                                className="block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                            />

                            <div className="flex bg-gray-800 rounded-md border border-gray-700 p-0.5">
                                <label className="cursor-pointer">
                                    <input type="radio" name="preferred_unit" value="kg" className="peer sr-only" defaultChecked={profile?.preferred_unit === 'kg' || !profile?.preferred_unit} />
                                    <div className="px-3 py-1.5 rounded text-xs font-medium text-gray-400 peer-checked:bg-indigo-600 peer-checked:text-white transition-all">KG</div>
                                </label>
                                <label className="cursor-pointer">
                                    <input type="radio" name="preferred_unit" value="lbs" className="peer sr-only" defaultChecked={profile?.preferred_unit === 'lbs'} />
                                    <div className="px-3 py-1.5 rounded text-xs font-medium text-gray-400 peer-checked:bg-indigo-600 peer-checked:text-white transition-all">LBS</div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>

                <div className="mt-8 border-t border-gray-800 pt-6">
                    <h2 className="text-xl font-bold mb-4">Activity</h2>
                    <a href="/history" className="block w-full bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between hover:border-indigo-500 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-900/20 p-2 rounded-lg text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
                            </div>
                            <span className="font-medium text-gray-200">Workout History</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-white"><path d="M9 18l6-6-6-6" /></svg>
                    </a>
                </div>
            </div>
        </div>
    )
}
