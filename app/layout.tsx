import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SonnerToaster } from "@/components/sonner-toaster"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "E2E AI Dev Agent",
  description:
    "End-to-end AI development agent that plans, prompts, executes, and tracks work across Jira-connected repos using CLINE CLI.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className={`font-sans antialiased ${geist.className}`}>
        {children}
        <SonnerToaster />
        <Analytics />
      </body>
    </html>
  )
}
