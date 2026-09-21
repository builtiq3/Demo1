"use client"
import { useEffect, useState, useMemo } from "react"

export default function AlMadinaShop(){
  const [products,setProducts]=useState([])
  const [cat,setCat]=useState("All")
  const [q,setQ]=useState("")
  const [drawer,setDrawer]=useState(false)
  const [cart,setCart]=useState([])
  const [custName,setCustName]=useState("")
  const [custPhone,setCustPhone]=useState("")
  const [loaded,setLoaded]=useState(false)

  useEffect(()=>{
    fetch("/api/products?store=almadina").then(r=>r.json()).then(d=>{
      setProducts(Array.isArray(d)? d : [])
    })
  },[])

  useEffect(()=>{
    const saved = localStorage.getItem('almadina_cart')
    if(saved){
      try{
        const parsed = JSON.parse(saved)
        if(Array.isArray(parsed) && parsed.length>0) setCart(parsed)
      }catch{}
    }
    const savedName = localStorage.getItem('almadina_name')
    const savedPhone = localStorage.getItem('almadina_phone')
    if(savedName) setCustName(savedName)
    if(savedPhone) setCustPhone(savedPhone)
    setLoaded(true)
  },[])

  useEffect(() => {
    if(!loaded) return
    localStorage.setItem('almadina_cart', JSON.stringify(cart))
  }, [cart, loaded])

  const safeProducts = products || []
  const cats = ["All",...new Set(safeProducts.map(p=>p.category).filter(Boolean))]
  const filtered = safeProducts.filter(p=> (cat==="All"||p.category===cat) && p.name?.toLowerCase().includes(q.toLowerCase()))

  const total = useMemo(()=> cart.reduce((s,i)=> s + i.price*i.qty,0),[cart])
  const count = useMemo(()=> cart.reduce((s,i)=> s + i.qty,0),[cart])

  const add = (p)=>{
    setCart(c=>{
      const f=c.find(x=>x.id===p.id)
      if(f) return c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x)
      return [...c,{...p,qty:1}]
    })
    setDrawer(true)
  }
  const inc = (id) => setCart(c => c.map(x => x.id===id? {...x, qty: x.qty+1} : x))
  const dec = (id) => {
    setCart(c => {
      const item = c.find(x=>x.id===id)
      if(!item) return c
      if(item.qty <= 1) return c.filter(x=>x.id!==id)
      return c.map(x => x.id===id? {...x, qty: x.qty-1} : x)
    })
  }

  const orderWhatsApp = async ()=>{
    if(cart.length===0) return alert("Cart empty")
    if(!custName ||!custPhone) return alert("Enter name & phone")
    localStorage.setItem('almadina_name', custName)
    localStorage.setItem('almadina_phone', custPhone)
    const itemsText = cart.map(i=> `${i.name} x${i.qty}`).join("%0A")
    await fetch("/api/orders",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ store:"almadina", items:cart, total, customer_name:custName, customer_phone:custPhone })
    })
    const msg = `Salam Al Madina!%0A%0ACustomer: ${custName}%0APhone: ${custPhone}%0A%0AOrder:%0A${itemsText}%0A%0ATotal: AED ${total}`
    window.open(`https://wa.me/971500000000?text=${msg}`,"_blank")
    setCart([])
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-zinc-900">
      {/* HEADER - MOBILE FIXED (NOT CONGESTED) */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#0a5c36] text-white grid place-items-center rounded-full font-black">م</div>
            <div className="leading-none">
              <div className="font-bold text-[15px]">Al Madina</div>
              <div className="text-[11px] text-zinc-400">Deira, Dubai</div>
            </div>
          </div>
          <button onClick={()=>setDrawer(true)} className="relative bg-black text-white px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2">
            <span>🛒</span>
            <span>{count}</span>
            <span className="hidden md:inline">- AED {total}</span>
            {count>0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] grid place-items-center rounded-full">{count}</span>}
          </button>
        </div>
        <div className="mt-3 md:hidden">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search rice, milk, dates..." className="w-full bg-zinc-100 px-4 py-2.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-black/10"/>
        </div>
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-3.5">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." className="bg-zinc-100 px-4 py-2 rounded-full text-sm w-64 outline-none"/>
        </div>
      </header>

      <div className="bg-[#0a5c36] text-white text-center py-2 text-[11px] tracking-wide">✓ Free Delivery in Deira for AED 100+ ✓ Cash on Delivery ✓ 9AM-11PM</div>

      <div className="px-4 py-3 flex gap-2 overflow-auto scrollbar-hide">
        {cats.map(c=>(
          <button key={c} onClick={()=>setCat(c)} className={`px-4 py-2 rounded-full text-sm border whitespace-nowrap transition ${cat===c?"bg-[#0a5c36] text-white border-[#0a5c36]":"bg-white hover:bg-zinc-50"}`}>{c}</button>
        ))}
      </div>

      <div className="px-4 pb-24 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-7xl mx-auto">
        {filtered.map(p=>(
          <div key={p.id} className="bg-white rounded-[20px] p-3 shadow-sm border hover:shadow-md transition">
            <img src={p.image_url} loading="lazy" alt={p.name} className="h-32 w-full object-cover rounded-[14px] bg-zinc-100"/>
            <div className="mt-3 text-[11px] text-zinc-500 uppercase tracking-wide">{p.category}</div>
            <div className="font-semibold leading-tight mt-1 text-[14px] line-clamp-2">{p.name}</div>
            <div className="flex justify-between items-center mt-3">
              <span className="font-black text-[14px]">AED {p.price}</span>
              <button onClick={()=>add(p)} className="bg-[#0a5c36] text-white w-8 h-8 rounded-full hover:bg-black transition">+</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length===0 && <div className="p-20 text-center text-zinc-400">No products found.</div>}

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={()=>setDrawer(false)} className="flex-1 bg-black/30 backdrop-blur-sm"></div>
          <div className="w-full max-w-[380px] bg-white p-6 flex flex-col h-full shadow-2xl">
            <div className="flex justify-between items-center">
              <b className="text-lg">Your Cart ({count})</b>
              <button onClick={()=>setDrawer(false)} className="w-8 h-8 bg-zinc-100 rounded-full">✕</button>
            </div>
            <div className="mt-6 space-y-3 flex-1 overflow-auto pr-1">
              {cart.map(i=>(
                <div key={i.id} className="flex justify-between items-center bg-zinc-50 p-3 rounded-2xl border">
                  <div className="flex-1 pr-3">
                    <div className="text-sm font-semibold leading-tight">{i.name}</div>
                    <div className="text-xs text-zinc-500 mt-1">AED {i.price} × {i.qty} = <b className="text-black">AED {i.price*i.qty}</b></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>dec(i.id)} className="w-8 h-8 rounded-full border bg-white grid place-items-center font-bold">−</button>
                    <span className="w-6 text-center text-sm font-black">{i.qty}</span>
                    <button onClick={()=>inc(i.id)} className="w-8 h-8 rounded-full bg-black text-white grid place-items-center font-bold">+</button>
                  </div>
                </div>
              ))}
              {cart.length===0 && <p className="text-zinc-400 text-center mt-20">Cart empty<br/>Add products</p>}
            </div>
            <div className="border-t pt-4 space-y-2">
              <input value={custName} onChange={e=>setCustName(e.target.value)} placeholder="Your Name" className="w-full border p-3 rounded-xl text-sm outline-none focus:border-black"/>
              <input value={custPhone} onChange={e=>setCustPhone(e.target.value)} placeholder="WhatsApp: 050..." className="w-full border p-3 rounded-xl text-sm outline-none focus:border-black"/>
              <div className="flex justify-between font-black text-lg py-2"><span>Total</span><span>AED {total}</span></div>
              <button onClick={orderWhatsApp} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-full font-bold text-sm transition">Order on WhatsApp</button>
              <div className="text-[10px] text-center text-zinc-400 pt-2">Secure • SSL Protected • BuildIQ</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}