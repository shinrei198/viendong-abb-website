export interface Env {
  ASSETS: Fetcher
  VIENDONG_KV?: KVNamespace
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // API Routes for persistent data storage
    if (url.pathname === '/api/site-data') {
      // Enable CORS for API
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        })
      }

      if (request.method === 'GET') {
        try {
          const stored = await env.VIENDONG_KV?.get('site_data')
          if (stored) {
            return new Response(stored, {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache',
              },
            })
          }
        } catch (err) {
          console.error('KV get error:', err)
        }
        return new Response(JSON.stringify({ exists: false }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }

      if (request.method === 'POST') {
        try {
          const body = await request.text()
          if (env.VIENDONG_KV) {
            await env.VIENDONG_KV.put('site_data', body)
            return new Response(
              JSON.stringify({
                success: true,
                message: 'Đã lưu thành công toàn bộ dữ liệu vào Cloudflare Database!',
              }),
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              }
            )
          } else {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Chưa gắn KV binding. Vui lòng kiểm tra cấu hình Cloudflare KV.',
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              }
            )
          }
        } catch (err: any) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          )
        }
      }
    }

    // Pass all other requests to static assets (SPA)
    return env.ASSETS.fetch(request)
  },
}
