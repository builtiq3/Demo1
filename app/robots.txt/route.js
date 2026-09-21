export async function GET(){
  return new Response(`User-agent: *
Allow: /
Sitemap: https://buildiq-digital-studio.vercel.app/sitemap.xml`)
}