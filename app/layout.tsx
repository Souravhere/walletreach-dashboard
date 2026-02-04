import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://walletreach.vercel.app/'),

  title: {
    default: 'WalletReach',
    template: '%s | WalletReach',
  },

  description:
    'WalletReach is a secure internal infrastructure tool designed to increase unique token holders on BNB Chain through controlled, intelligent, and optimized token distribution.',

  keywords: [
    'WalletReach',
    'Holder Growth Engine',
    'BNB Chain Tool',
    'Token Distribution',
    'Blockchain Infrastructure',
    'Web3 Internal Tool',
    'BSC Holder Growth',
    'Crypto Operations Dashboard',
  ],

  authors: [{ name: 'WalletReach' }],
  creator: 'WalletReach',
  applicationName: 'WalletReach',

  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },

  openGraph: {
    title: 'WalletReach – Internal Holder Growth Engine',
    description:
      'A professional internal dashboard built to scale unique token holders on BNB Chain through secure and optimized reward distribution.',
    url: 'https://walletreach.vercel.app/',
    siteName: 'WalletReach',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'WalletReach Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'WalletReach – Internal Holder Growth Engine',
    description:
      'Secure internal infrastructure for intelligent holder growth on BNB Chain.',
    images: ['/og.png'],
  },

  robots: {
    index: true,
    follow: true,
  },

  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
