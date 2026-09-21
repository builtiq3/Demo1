export async function GET(){
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://buildiq-digital-studio.vercel.app/</loc></url>
  <url><loc>https://buildiq-digital-studio.vercel.app/work/almadina</loc></url>
</urlset>`, { headers: { "Content-Type": "text/xml" } })
}