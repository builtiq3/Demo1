import { supabase } from "../../../lib/supabase"

export async function POST(req){
  const b = await req.json()
  const {data} = await supabase.from("orders").insert({
    store: b.store||"almadina", 
    items: b.items, 
    total: b.total
  }).select().single()
  return Response.json(data)
}