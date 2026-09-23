import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { APP_CONFIG } from "@/lib/utils/constants"
import { AiTutorChat } from "@/components/chat/AiTutorChat"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: APP_CONFIG.pwa.theme,
}

export const metadata: Metadata = {
  title: APP_CONFIG.pwa.appName,
  description: APP_CONFIG.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_CONFIG.pwa.shortName,
  },
  formatDetection: {
    telephone: false,
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="apple-touch-icon"
          href="/icons/eli-192.png"
          sizes="192x192"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/eli-192.png"
          sizes="192x192"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta
          name="apple-mobile-web-app-title"
          content={APP_CONFIG.pwa.shortName}
        />
        <meta name="theme-color" content={APP_CONFIG.pwa.theme} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        {children}
        <AiTutorChat />
      </body>
    </html>
  )
}
