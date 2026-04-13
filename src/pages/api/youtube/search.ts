import type { APIRoute } from 'astro'

const YT_API_KEY = import.meta.env.YOUTUBE_API_KEY

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q')?.trim()
  if (!q) return new Response(JSON.stringify({ error: 'missing q' }), { status: 400 })

  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&maxResults=1&q=${encodeURIComponent(q)}&key=${YT_API_KEY}`
    const res = await fetch(apiUrl)
    if (!res.ok) return new Response(JSON.stringify({ error: 'youtube api error' }), { status: 502 })
    const data = await res.json()
    const videoId = data.items?.[0]?.id?.videoId ?? null
    return new Response(JSON.stringify({ videoId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'internal error' }), { status: 500 })
  }
}
