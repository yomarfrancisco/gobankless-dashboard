import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import IosKeyboardShim from '@/components/IosKeyboardShim'
import TopNotifications from '@/components/notifications/TopNotifications'
import DevNotificationSetup from '@/components/notifications/DevNotificationSetup'
import { WalletModeProvider } from '@/state/walletMode'
import { WalletAllocProvider } from '@/state/walletAlloc'
import SplashOnceProvider from '@/providers/SplashOnceProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GoBankless',
  description: 'GoBankless cash-card UI',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var m = localStorage.getItem('gb.walletMode') || 'autonomous';
    document.documentElement.dataset.walletMode = m;
  } catch(_) { 
    document.documentElement.dataset.walletMode = 'autonomous'; 
  }
})();`,
          }}
        />
        <IosKeyboardShim />
        <SplashOnceProvider>
          <WalletModeProvider>
            <WalletAllocProvider>
              <TopNotifications />
              <DevNotificationSetup />
              {children}
            </WalletAllocProvider>
          </WalletModeProvider>
        </SplashOnceProvider>
      </body>
    </html>
  )
}

