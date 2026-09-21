import { supabase } from "../../../lib/supabase"

export async function GET(req){
  const store = new URL(req.url).searchParams.get("store")||"almadina"
  const {data, error} = await supabase.from("products").select("*").eq("store",store)
  if(error) return Response.json({ error: error.message }, {status: 500})
  return Response.json(data)
}
export async function POST(req){
  const b = await req.json()
  if(b.adminKey !== process.env.ADMIN_SECRET_KEY) return Response.json({error:"Unauthorized"},{status:401})
  const {data, error} = await supabase.from("products").insert({
    store: b.store||"almadina", name: b.name, price: parseFloat(b.price), category: b.category, image_url: b.image_url
  }).select().single()
  if(error) return Response.json({error: error.message},{status:500})
  return Response.json(data)
}
export async function DELETE(req){
  const url = new URL(req.url)
  if(url.searchParams.get("key") !== process.env.ADMIN_SECRET_KEY) return Response.json({error:"Unauthorized"},{status:401})
  const {error} = await supabase.from("products").delete().eq("id", url.searchParams.get("id"))
  if(error) return Response.json({error: error.message},{status:500})
  return Response.json({success:true})
}