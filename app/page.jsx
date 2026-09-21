import Link from "next/link"
export default function Home(){
  return (
    <div style={{padding:50}}>
      <h1>BuildIQ Demo</h1>
      <Link href="/work/almadina" style={{background:'black',color:'white',padding:'12px 24px',borderRadius:8,textDecoration:'none'}}>
        Open Al Madina →
      </Link>
      <div style={{marginTop:20}}>
        <a href="/api/products?store=almadina" target="_blank">Test API</a>
      </div>
    </div>
  )
}