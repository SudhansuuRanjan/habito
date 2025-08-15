import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "Habito",
  description: "A habit tracking app for improving your daily routine.",
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
