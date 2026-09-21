"use client"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function Admin(){
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({name:'', price:'', category:'Rice', image_url:'', stock:true})
  const [editId, setEditId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState('products')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const categories = ["Rice","Dates","Milk","Oil","Spices"]

  const load = async()=>{
    const {data} = await supabase.from("products").select("*").order("created_at", {ascending:false})
    setProducts(data||[])
  }
  useEffect(()=>{load()},[])

  const uploadImage = async(e)=>{
    const file = e.target.files[0]
    if(!file) return
    setUploading(true)
    const name = Date.now()+"_"+file.name
    const {data, error} = await supabase.storage.from("product-images").upload(name, file)
    if(!error){
      const {data: url} = supabase.storage.from("product-images").getPublicUrl(name)
      setForm({...form, image_url: url.publicUrl})
    }
    setUploading(false)
  }

    const saveProduct = async()=>{
    if(!form.name ||!form.price) return alert("Name + Price required")
    const payload = {
      name: form.name, 
      price: Number(form.price), 
      category: form.category, 
      image_url: form.image_url, 
      in_stock: form.stock
    }
    if(editId){
      await supabase.from("products").update(payload).eq("id", editId)
    } else {
      await supabase.from("products").insert(payload)
    }
    setForm({name:'', price:'', category:'Rice', image_url:'', stock:true}); setEditId(null); load()
  }

  const edit = (p)=>{ setForm({name:p.name, price:p.price, category:p.category, image_url:p.image_url, stock:p.in_stock}); setEditId(p.id); window.scrollTo(0,0)}

  const del = async(id)=>{ if(confirm("Delete?")){ await supabase.from("products").delete().eq("id", id); load()} }

    const toggleOffer = async(p)=>{
    const newOffer =!p.is_on_offer
    if(newOffer){
      const offerPrice = prompt(`Offer price for ${p.name} (Original AED ${p.price})`, Math.round(p.price*0.8))
      if(!offerPrice) return
      const op = Number(offerPrice)
      const disc = Math.round((1-op/Number(p.price))*100)
      await supabase.from("products").update({is_on_offer:true, offer_price: op, discount_percent: disc}).eq("id", p.id)
    } else {
      await supabase.from("products").update({is_on_offer:false, offer_price: null, discount_percent: null}).eq("id", p.id)
    }
    load()
  }
  const generateBrochure = ()=>{
    const offerProducts = products.filter(p=>p.is_on_offer)
    if(offerProducts.length===0) return alert("No offer products selected")
    // Simple print window for brochure
    const win = window.open("","_blank")
    win.document.write(`
      <html><head><title>Al Madina Offers Brochure</title>
      <style>body{font-family:sans-serif;padding:20px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.card{border:2px dashed #eab308;padding:10px;text-align:center} img{width:100%;height:150px;object-fit:cover}.price{color:green;font-weight:bold}.old{text-decoration:line-through;color:gray}</style>
      </head><body>
      <h1 style="text-align:center;background:#facc15;padding:10px">AL MADINA OFFERS - THIS WEEK</h1>
      <div class="grid">
      ${offerProducts.map(p=>`<div class="card"><img src="${p.image_url}"/><h3>${p.name}</h3><p><span class="old">AED ${p.price}</span> <span class="price">AED ${p.offer_price}</span> (${p.discount_percent}% OFF)</p></div>`).join("")}
      </div>
      <script>window.print()</script>
      </body></html>
    `)
  }

  const filtered = categoryFilter==='All'? products : products.filter(p=>p.category===categoryFilter)

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex gap-2 mb-6">
        <button onClick={()=>setTab('products')} className={`px-4 py-2 rounded ${tab==='products'?'bg-black text-white':'bg-zinc-200'}`}>Products</button>
        <button onClick={()=>setTab('offers')} className={`px-4 py-2 rounded ${tab==='offers'?'bg-yellow-400':'bg-zinc-200'}`}>Offers Manager + Brochure</button>
      </div>

      {tab==='products' && (
        <>
          <div className="bg-white border p-4 rounded-lg mb-6">
            <h2 className="font-bold mb-3">{editId?'Edit Product':'Add Product'}</h2>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Product Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="border p-2 rounded"/>
              <input placeholder="Price AED" type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="border p-2 rounded"/>
              <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="border p-2 rounded">
                {categories.map(c=><option key={c}>{c}</option>)}
              </select>
              <label className="border p-2 rounded flex items-center gap-2"><input type="checkbox" checked={form.stock} onChange={e=>setForm({...form, stock:e.target.checked})}/> In Stock</label>
              <input type="file" onChange={uploadImage} className="col-span-2"/>
              {form.image_url && <img src={form.image_url} className="w-24 h-24 object-cover rounded col-span-2"/>}
              {uploading && <p>Uploading...</p>}
            </div>
            <button onClick={saveProduct} className="mt-3 bg-black text-white px-6 py-2 rounded">{editId?'Update':'Add'} Product</button>
            {editId && <button onClick={()=>{setEditId(null); setForm({name:'', price:'', category:'Rice', image_url:'', stock:true})}} className="ml-2 px-4 py-2">Cancel</button>}
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {products.map(p=>(
              <div key={p.id} className="border rounded p-3 bg-white">
                <img src={p.image_url} className="h-32 w-full object-cover rounded"/>
                <h3 className="font-bold mt-2">{p.name}</h3>
                <p className="text-sm">AED {p.price} - {p.category} - {p.in_stock?'In Stock':'Out'}</p>
                <div className="flex gap-1 mt-2 text-xs">
                  <button onClick={()=>edit(p)} className="bg-zinc-100 px-2 py-1 rounded">Edit</button>
                  <button onClick={()=>del(p.id)} className="bg-red-100 px-2 py-1 rounded">Delete</button>
                  <button onClick={()=>toggleOffer(p)} className={`px-2 py-1 rounded ${p.is_on_offer?'bg-green-200':'bg-yellow-100'}`}>{p.is_on_offer?'Remove Offer':'Make Offer'}</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab==='offers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="border p-2 rounded">
              <option value="All">All Categories</option>
              {categories.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={generateBrochure} className="bg-yellow-400 px-6 py-2 rounded font-bold">🖨️ Auto Generate Brochure (Print/PDF)</button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {filtered.map(p=>(
              <div key={p.id} className={`border-2 rounded p-3 ${p.is_on_offer?'border-yellow-400 bg-yellow-50':'bg-white'}`}>
                <img src={p.image_url} className="h-28 w-full object-cover"/>
                <h3 className="font-bold">{p.name} - AED {p.price}</h3>
                <p className="text-xs">{p.category} | {p.is_on_offer? `OFFER: AED ${p.offer_price} (${p.discount_percent}% OFF)` : 'Not on offer'}</p>
                <button onClick={()=>toggleOffer(p)} className="mt-2 w-full bg-black text-white py-1 rounded text-sm">
                  {p.is_on_offer? 'Remove from Offers' : 'Add to Offers'}
                </button>
              </div>
            ))}
          </div>

            <div className="mt-6 p-4 bg-zinc-100 rounded text-sm">
            <b>How Brochure Works:</b> Select products per category using &quot;Add to Offers&quot; then click Auto Generate Brochure then Save as PDF then Send to WhatsApp customers. Offer page auto-updates.
            <br/>Frontend: <a href="/work/almadina/offers" className="underline text-blue-600">/work/almadina/offers</a>
          </div>
        </div>
      )}
    </div>
  )
}