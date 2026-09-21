export const metadata = {
  title: "Al Madina Hypermarket Deira | Fresh Groceries Dubai",
  description: "Order fresh rice, dates, milk, bread in Deira Dubai. Same-day WhatsApp delivery. AED 35+ free delivery.",
  keywords: "Al Madina Deira, grocery Dubai, supermarket Deira",
}

export default function Layout({ children }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    "name": "Al Madina Hypermarket",
    "address": { "@type": "PostalAddress", "addressLocality": "Deira", "addressRegion": "Dubai", "addressCountry": "AE" },
    "telephone": "+971562512042",
    "priceRange": "AED 1-100"
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  )
}