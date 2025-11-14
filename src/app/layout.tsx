import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import IosKeyboardShim from '@/components/IosKeyboardShim'
import TopNotifications from '@/components/notifications/TopNotifications'
import DevNotificationSetup from '@/components/notifications/DevNotificationSetup'
import { WalletModeProvider } from '@/state/walletMode'
import { WalletAllocProvider } from '@/state/walletAlloc'
import SplashOnceProvider from '@/providers/SplashOnceProvider'
import TransactionSheet from '@/components/TransactionSheet'
import ProfileEditSheet from '@/components/ProfileEditSheet'
import AvatarEditSheet from '@/components/AvatarEditSheet'
import ProfileNameHandleSheet from '@/components/ProfileNameHandleSheet'
import SocialLinksSheet from '@/components/SocialLinksSheet'
import ProfileDescriptionSheet from '@/components/ProfileDescriptionSheet'
import SupportSheet from '@/components/SupportSheet'
import ShareProfileSheet from '@/components/ShareProfileSheet'

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
    var m = localStorage.getItem('gb.walletMode') || 'manual';
    document.documentElement.dataset.walletMode = m;
  } catch(_) { 
    document.documentElement.dataset.walletMode = 'manual'; 
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
              {/* Global Transact Sheet */}
              <TransactionSheet />
              {/* Global Profile Edit Sheet */}
              <ProfileEditSheet />
              {/* Global Avatar Edit Sheet */}
              <AvatarEditSheet />
              {/* Global Name & Handle Sheet */}
              <ProfileNameHandleSheet />
              {/* Global Social Links Sheet */}
              <SocialLinksSheet />
              {/* Global Profile Description Sheet */}
              <ProfileDescriptionSheet />
              {/* Global Support Sheet */}
              <SupportSheet />
              {/* Global Share Profile Sheet */}
              <ShareProfileSheet />
            </WalletAllocProvider>
          </WalletModeProvider>
        </SplashOnceProvider>
        <Script
          id="chatbase-widget"
          strategy="afterInteractive"
        >{`
          (function(){
            if (
              !window.chatbase ||
              window.chatbase("getState") !== "initialized"
            ) {
              window.chatbase = (...arguments) => {
                if (!window.chatbase.q) {
                  window.chatbase.q = [];
                }
                window.chatbase.q.push(arguments);
              };
              window.chatbase = new Proxy(window.chatbase, {
                get(target, prop) {
                  if (prop === "q") {
                    return target.q;
                  }
                  return (...args) => target(prop, ...args);
                },
              });
            }
            const onLoad = function () {
              const script = document.createElement("script");
              script.src = "https://chat.mystablecoin.app/embed.min.js";
              script.id = "2wO054pAvier4ISsuZd_X";
              script.domain = "chat.mystablecoin.app";
              document.body.appendChild(script);
            };
            if (document.readyState === "complete") {
              onLoad();
            } else {
              window.addEventListener("load", onLoad);
            }
          })();
        `}</Script>
      </body>
    </html>
  )
}

