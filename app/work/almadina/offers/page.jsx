"use client"
import { useEffect, useState } from "react"

export default function OffersPage(){
  const [data, setData] = useState([])

  useEffect(()=>{
    async function load(){
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
      const all = await res.json()
      // only show offers
      const offers = (Array.isArray(all) ? all : []).filter(p => p.is_on_offer === true)
      setData(offers)
    }
    load()

    // Realtime when admin adds offer
    ;(async()=>{
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      supabase.channel('offers-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          load()
        })
        .subscribe()
    })()
  },[])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center bg-yellow-400 py-3 rounded">🔥 Al Madina Weekly Offers</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {data?.map(p=>(
          <div key={p.id} className="border-2 border-yellow-400 rounded-lg p-3 bg-white text-center">
            <img src={p.image_url} className="h-36 w-full object-cover rounded"/>
            <h3 className="font-bold mt-2">{p.name}</h3>
            <p><span className="line-through text-zinc-400">AED {p.price}</span> <span className="text-green-600 font-bold text-lg">AED {p.offer_price || p.price}</span></p>
            {p.discount_percent && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">{p.discount_percent}% OFF</span>}
            <button className="w-full mt-2 bg-black text-white py-2 rounded">Add to Cart</button>
          </div>
        ))}
      </div>
      {data.length===0 && <p className="text-center mt-10">No offers this week. Check back soon!</p>}
    </div>
  )
}