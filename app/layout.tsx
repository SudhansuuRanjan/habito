import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "Habitto",
  description: "A habit tracking app for improving your daily routine.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Habitto",
    description: "A habit tracking app for improving your daily routine.",
    url: "https://habitto.vercel.app", // replace with your real domain
    siteName: "Habitto",
    images: [
      {
        url: "https://habitto.vercel.app/og-image.jpg", // full URL required for crawlers
        width: 1200,
        height: 630,
        alt: "Habitto - Build better daily habits",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habitto",
    description: "A habit tracking app for improving your daily routine.",
    images: ["https://habitto.vercel.app/og-image.jpg"],
    creator: "@Sudhanss_u", // optional: your Twitter handle
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <Navigation />
        <main>{children}</main>
        <footer className="text-center text-sm text-muted-foreground py-4">
          Built with ❤️ by Sudhanshu Ranjan.
        </footer>
      </body>
    </html>
  )
}
