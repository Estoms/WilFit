import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
        return new NextResponse('Missing ID', { status: 400 })
    }

    const RAPID_API_KEY = process.env.RAPIDAPI_KEY
    if (!RAPID_API_KEY) {
        return new NextResponse('Server Misconfiguration', { status: 500 })
    }

    // "Basic" plan usually allows 180 or 360. Safest is to try 360 or let logic handle it.
    // The documentation says "Basic: 180". Let's try to ask for 360, it might fallback?
    // Or just ask for the default endpoint without resolution?
    // Docs say: GET https://exercisedb.p.rapidapi.com/image?exerciseId=...&resolution=...
    // Let's use resolution=180 to be safe for free/basic tier users.
    const targetUrl = `https://exercisedb.p.rapidapi.com/exercises/exercise-images/${id}`

    // Wait, the docs said: https://exercisedb.p.rapidapi.com/image
    // Let's re-read the search result carefully.
    // "URL: https://exercisedb.p.rapidapi.com/image"
    // Params: exerciseId, resolution, rapidapi-key

    // BUT the previous search result I saw earlier "API response example" had urls like ".../exercises/exercise-images/..."?
    // No, that was my debug script which DID NOT show any URL.

    // Let's trust the railway.app result: `https://exercisedb.p.rapidapi.com/image`
    // Wait, let me double check the "debug_api.js" usage. I used `/exercises/name/...`.

    // Let's try the new endpoint structure.

    // Actually, I can try to fetch both or just the one documented.
    // Let's go with the documented one.

    const imageUrl = `https://exercisedb.p.rapidapi.com/exercises/exercise-images/${id}`
    // Wait, I am confused about the URL structure.
    // Let's look at the search result 494 again.
    // URL: https://exercisedb.p.rapidapi.com/image
    // Query params: exerciseId=...

    // So the URL should be:
    const fetchUrl = `https://exercisedb.p.rapidapi.com/image?exerciseId=${id}&resolution=360`

    try {
        const response = await fetch(fetchUrl, {
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
            }
        })

        if (!response.ok) {
            console.error('Image Proxy Error:', response.status, response.statusText)
            return new NextResponse('Failed to fetch image', { status: response.status })
        }

        // Forward the image
        const contentType = response.headers.get('content-type') || 'image/gif'
        const buffer = await response.arrayBuffer()

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400' // Cache for 1 day
            }
        })

    } catch (e) {
        console.error('Proxy Exception:', e)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
