import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from './actions'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold mb-6">Profile</h1>

                <form action={updateProfile} className="space-y-6">
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
            </div>
        </div>
    )
}
