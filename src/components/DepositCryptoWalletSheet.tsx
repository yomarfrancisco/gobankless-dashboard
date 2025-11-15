'use client'

import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'
import styles from './DepositCryptoWalletSheet.module.css'

type DepositCryptoWallet = {
  key: 'usdt_sa' | 'usdt_mzn' | 'pepe' | 'eth' | 'btc'
  title: string
  description: string
  cardImage: string
}

const depositCryptoWallets: DepositCryptoWallet[] = [
  {
    key: 'usdt_sa',
    title: 'USDT SA wallet',
    description: 'Copy or scan the QR for this address to deposit USDT from South African accounts.',
    cardImage: '/assets/cards/card-savings.jpg',
  },
  {
    key: 'usdt_mzn',
    title: 'USDT MZN wallet',
    description: 'Copy or scan the QR for this address to deposit USDT from Mozambican accounts.',
    cardImage: '/assets/cards/card-MZN.jpg',
  },
  {
    key: 'pepe',
    title: 'PEPE wallet',
    description: 'Copy or scan the QR for this address to deposit PEPE directly into this profile.',
    cardImage: '/assets/cards/card-pepe.jpg',
  },
  {
    key: 'eth',
    title: 'ETH wallet',
    description: 'Copy or scan the QR for this address to deposit ETH directly into this profile.',
    cardImage: '/assets/cards/card-ETH.jpg',
  },
  {
    key: 'btc',
    title: 'BTC wallet',
    description: 'Copy or scan the QR for this address to deposit BTC directly into this profile.',
    cardImage: '/assets/cards/card-BTC.jpg',
  },
]

type Props = {
  open: boolean
  onClose: () => void
  onSelectCryptoDepositWallet?: (walletKey: 'usdt_sa' | 'usdt_mzn' | 'pepe' | 'eth' | 'btc') => void
}

export default function DepositCryptoWalletSheet({ open, onClose, onSelectCryptoDepositWallet }: Props) {
  const handleSelect = (walletKey: 'usdt_sa' | 'usdt_mzn' | 'pepe' | 'eth' | 'btc') => {
    if (onSelectCryptoDepositWallet) {
      onSelectCryptoDepositWallet(walletKey)
    } else {
      // Stub for now
      console.log('Selected crypto deposit wallet:', walletKey)
    }
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="Deposit to crypto wallet" size="compact">
      {depositCryptoWallets.map((wallet) => (
        <ActionSheetItem
          key={wallet.key}
          icon={
            <div className={styles.cardIcon}>
              <Image
                src={wallet.cardImage}
                alt={wallet.title}
                width={40}
                height={26}
                className={styles.cardIconImage}
                unoptimized
              />
            </div>
          }
          title={wallet.title}
          caption={wallet.description}
          onClick={() => handleSelect(wallet.key)}
          trailing={<ChevronRight size={24} strokeWidth={2} style={{ color: 'rgba(0, 0, 0, 0.4)' }} />}
        />
      ))}
    </ActionSheet>
  )
}

