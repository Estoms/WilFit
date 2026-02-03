import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    try {
        // Debug: Check if env vars are present
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('Missing Supabase environment variables')
            // Don't crash, just proceed without auth? Or return error?
            // Returning error helps user realize they forgot env vars.
            return NextResponse.json(
                { error: 'Missing environment variables in Vercel configuration.' },
                { status: 500 }
            )
        }

        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        })

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        )
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // This will refresh session if needed
        await supabase.auth.getUser()

        return response
    } catch (e) {
        console.error('Middleware error:', e)
        // If middleware fails, try to proceed as if no auth happened, to avoid 500 on whole site
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        })
    }
}
