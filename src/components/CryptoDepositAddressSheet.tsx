'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Copy } from 'lucide-react'
import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'
import { generateQRCode } from '@/lib/qr'
import { useNotificationStore } from '@/store/notifications'
import { type DepositCryptoWallet } from './DepositCryptoWalletSheet'
import styles from './CryptoDepositAddressSheet.module.css'

const coinIconMap: Record<'usdt' | 'eth' | 'pepe' | 'btc', string> = {
  usdt: '/assets/Tether.png',
  eth: '/assets/eth_coin.png',
  pepe: '/assets/pepe_coin.png',
  btc: '/assets/Bitcoin-Logo.png',
}

const coinLabelMap: Record<'usdt' | 'eth' | 'pepe' | 'btc', string> = {
  usdt: 'USDT',
  eth: 'ETH',
  pepe: 'PEPE',
  btc: 'BTC',
}

type Props = {
  open: boolean
  onClose: () => void
  wallet: DepositCryptoWallet
}

export default function CryptoDepositAddressSheet({ open, onClose, wallet }: Props) {
  const pushNotification = useNotificationStore((state) => state.pushNotification)
  const [qrDataURL, setQrDataURL] = useState<string | null>(null)

  // Generate QR code when sheet opens
  useEffect(() => {
    if (!open) return

    const generateQR = async () => {
      try {
        const qr = await generateQRCode(wallet.address, 220)
        setQrDataURL(qr)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
        pushNotification({
          kind: 'payment_failed',
          title: 'Error',
          body: 'Failed to generate QR code',
        })
      }
    }

    generateQR()
  }, [open, wallet.address, pushNotification])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address)
      pushNotification({
        kind: 'payment_sent',
        title: 'Copied!',
        body: `${coinLabelMap[wallet.coin]} address copied`,
      })
    } catch (error) {
      console.error('Failed to copy address:', error)
      pushNotification({
        kind: 'payment_failed',
        title: 'Error',
        body: 'Failed to copy address',
      })
    }
  }

  const coinLabel = coinLabelMap[wallet.coin]

  return (
    <ActionSheet open={open} onClose={onClose} title={`Deposit to ${wallet.title}`} size="compact">
      <div className={styles.content}>
        {/* QR code */}
        <div className={styles.qrWrapper}>
          {qrDataURL ? (
            <img src={qrDataURL} alt="QR Code" className={styles.qrImage} />
          ) : (
            <div className={styles.qrPlaceholder}>Generating QR code...</div>
          )}
        </div>

        {/* Raw address */}
        <div className={styles.addressBox}>
          <code className={styles.addressText}>{wallet.address}</code>
        </div>

        {/* Copy row */}
        <ActionSheetItem
          icon={
            <div className={styles.coinIcon}>
              <Image
                src={coinIconMap[wallet.coin]}
                alt={`${coinLabel} logo`}
                width={40}
                height={40}
                className={styles.coinIconImage}
                unoptimized
              />
            </div>
          }
          title={`Copy ${coinLabel} address`}
          caption={`Copy this address or share it with someone to deposit ${coinLabel} directly into this wallet.`}
          onClick={handleCopy}
          trailing={<Copy size={18} strokeWidth={2} style={{ color: '#111' }} />}
        />
      </div>
    </ActionSheet>
  )
}

