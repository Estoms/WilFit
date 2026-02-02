import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, User, LayoutDashboard, LogOut, Calendar as CalendarIcon, Plus } from 'lucide-react'
import { signout } from '@/app/auth/actions'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Protect all routes by default? Or just dashboard?
    // User asked for "Redirect if not connected -> Login".
    // This layout usually wraps the main app.

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-20">
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
                <div className="container mx-auto max-w-md px-6 flex justify-between items-center h-16">
                    <Link href="/" className="flex flex-col items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors">
                        <LayoutDashboard size={24} />
                        <span className="text-[10px] uppercase font-bold mt-1 tracking-wide">Home</span>
                    </Link>
                    <Link href="/schedule" className="flex flex-col items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors">
                        <CalendarIcon size={24} />
                        <span className="text-[10px] uppercase font-bold mt-1 tracking-wide">Plan</span>
                    </Link>

                    {/* Central Action Button */}
                    <div className="relative -top-5">
                        <Link href="/workouts/new" className="flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/50 hover:scale-105 hover:bg-indigo-500 transition-all border-4 border-gray-950">
                            <Plus size={28} className="text-white" />
                        </Link>
                    </div>

                    <Link href="/profile" className="flex flex-col items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors">
                        <User size={24} />
                        <span className="text-[10px] uppercase font-bold mt-1 tracking-wide">Profil</span>
                    </Link>
                    <Link href="/exercises" className="flex flex-col items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors">
                        <Dumbbell size={24} />
                        <span className="text-[10px] uppercase font-bold mt-1 tracking-wide">Library</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}
