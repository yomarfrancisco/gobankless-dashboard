'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Share2, Copy, Download, ChevronRight } from 'lucide-react'
import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'
import { useShareProfileSheet } from '@/store/useShareProfileSheet'
import { useUserProfileStore } from '@/store/userProfile'
import { generateQRCodeWithLogo, downloadQRCode } from '@/lib/qr'
import { pushNotification } from '@/store/notifications'
import styles from './ShareProfileSheet.module.css'

export default function ShareProfileSheet() {
  const { isOpen, close } = useShareProfileSheet()
  const { profile } = useUserProfileStore()
  const [qrDataURL, setQrDataURL] = useState<string | null>(null)

  // Generate QR code when sheet opens
  useEffect(() => {
    if (!isOpen) return

    const generateQR = async () => {
      try {
        const handle = profile.userHandle || '@samakoyo'
        const paymentUrl = `https://gobankless.app/pay/${handle.replace('@', '')}`
        const qr = await generateQRCodeWithLogo(paymentUrl, '/assets/GO_logo.png', 220, 52)
        setQrDataURL(qr)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
        pushNotification({
          type: 'error',
          title: 'Error',
          body: 'Failed to generate QR code',
        })
      }
    }

    generateQR()
  }, [isOpen, profile.userHandle])

  const handleShare = async () => {
    const handle = profile.userHandle || '@samakoyo'
    const paymentUrl = `https://gobankless.app/pay/${handle.replace('@', '')}`

    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'My GoBankless Profile',
          text: `Pay me on GoBankless: ${handle}`,
          url: paymentUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy()
    }
  }

  const handleCopy = async () => {
    const handle = profile.userHandle || '@samakoyo'
    const paymentUrl = `https://gobankless.app/pay/${handle.replace('@', '')}`

    try {
      await navigator.clipboard.writeText(paymentUrl)
      pushNotification({
        type: 'success',
        title: 'Copied!',
        body: 'Payment link copied to clipboard',
      })
    } catch (error) {
      console.error('Failed to copy:', error)
      pushNotification({
        type: 'error',
        title: 'Error',
        body: 'Failed to copy link',
      })
    }
  }

  const handleDownload = () => {
    if (!qrDataURL) {
      pushNotification({
        type: 'error',
        title: 'Error',
        body: 'QR code not ready yet',
      })
      return
    }

    const handle = profile.userHandle || '@samakoyo'
    const filename = `gobankless-qr-${handle.replace('@', '')}.png`
    downloadQRCode(qrDataURL, filename)
    pushNotification({
      type: 'success',
      title: 'Downloaded!',
      body: 'QR code saved to your device',
    })
  }

  const displayHandle = profile.userHandle || '@samakoyo'

  return (
    <ActionSheet open={isOpen} onClose={close} title="Share Profile" size="compact" className={styles.shareSheet}>
      <div className={styles.content}>
        {/* QR Block */}
        <div className={styles.qrContainer}>
          {qrDataURL ? (
            <img src={qrDataURL} alt="QR Code" className={styles.qrImage} />
          ) : (
            <div className={styles.qrPlaceholder}>Generating QR code...</div>
          )}
        </div>

        {/* User Handle */}
        <div className={styles.handleText}>{displayHandle}</div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Action Rows */}
        <ActionSheetItem
          icon={<Share2 size={24} strokeWidth={2} style={{ color: '#111' }} />}
          title="Share my profile"
          caption="Send your GoBankless profile to anyone."
          onClick={handleShare}
        />
        <ActionSheetItem
          icon={<Copy size={24} strokeWidth={2} style={{ color: '#111' }} />}
          title="Copy payment link"
          caption="Copy your personal payment URL."
          onClick={handleCopy}
        />
        <ActionSheetItem
          icon={<Download size={24} strokeWidth={2} style={{ color: '#111' }} />}
          title="Download my QR"
          caption="Save your QR code to your device."
          onClick={handleDownload}
        />
      </div>
    </ActionSheet>
  )
}

