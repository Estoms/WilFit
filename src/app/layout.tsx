import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { clsx } from 'clsx'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'WilFit',
    description: 'Data-Driven Workout Tracker',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full bg-gray-950">
            <body className={clsx(inter.className, 'h-full text-white antialiased')}>
                {children}
            </body>
        </html>
    )
}
