import "./globals.css"

export const metadata = {
  title: "BuildIQ Digital Studio | Websites That Convert",
  description: "We build SEO Ready, Secure, Fast websites in Dubai",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {/* POINT 6: Replace G-XXXX when client gives ID */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
        <script dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);} gtag('js',new Date()); gtag('config','G-XXXXXXX');`}} />
      </body>
    </html>
  )
}