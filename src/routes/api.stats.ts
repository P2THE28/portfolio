import { createFileRoute } from '@tanstack/react-router'
import { getAllStats } from '@/lib/live-stats'

export const Route = createFileRoute('/api/stats')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const stats = await getAllStats({ refreshLeetCode: url.searchParams.get('refresh') === 'leetcode' })
        return Response.json(stats, { headers: { 'Cache-Control': 'no-store' } })
      },
    },
  },
})
