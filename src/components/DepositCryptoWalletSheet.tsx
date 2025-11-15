'use client'

import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'
import { useUserProfileStore } from '@/store/userProfile'
import styles from './DepositCryptoWalletSheet.module.css'

export type DepositCryptoWallet = {
  key: 'usdt_sa' | 'usdt_mzn' | 'pepe' | 'eth' | 'btc'
  title: string
  description: string
  cardImage: string
  coin: 'usdt' | 'eth' | 'pepe' | 'btc'
  address: string
}

// Helper to get wallet config with addresses from profile store
export const getDepositCryptoWallets = (addresses: {
  usdtSaAddress?: string
  usdtMznAddress?: string
  pepeAddress?: string
  ethAddress?: string
  btcAddress?: string
}): DepositCryptoWallet[] => [
  {
    key: 'usdt_sa',
    title: 'USDT SA wallet',
    description: 'Copy or scan the QR for this address to deposit USDT from South African accounts.',
    cardImage: '/assets/cards/card-savings.jpg',
    coin: 'usdt',
    address: addresses.usdtSaAddress || '0x0000000000000000000000000000000000000000',
  },
  {
    key: 'usdt_mzn',
    title: 'USDT MZN wallet',
    description: 'Copy or scan the QR for this address to deposit USDT from Mozambican accounts.',
    cardImage: '/assets/cards/card-MZN.jpg',
    coin: 'usdt',
    address: addresses.usdtMznAddress || '0x0000000000000000000000000000000000000000',
  },
  {
    key: 'pepe',
    title: 'PEPE wallet',
    description: 'Copy or scan the QR for this address to deposit PEPE directly into this profile.',
    cardImage: '/assets/cards/card-pepe.jpg',
    coin: 'pepe',
    address: addresses.pepeAddress || '0x0000000000000000000000000000000000000000',
  },
  {
    key: 'eth',
    title: 'ETH wallet',
    description: 'Copy or scan the QR for this address to deposit ETH directly into this profile.',
    cardImage: '/assets/cards/card-ETH.jpg',
    coin: 'eth',
    address: addresses.ethAddress || '0x0000000000000000000000000000000000000000',
  },
  {
    key: 'btc',
    title: 'BTC wallet',
    description: 'Copy or scan the QR for this address to deposit BTC directly into this profile.',
    cardImage: '/assets/cards/card-BTC.jpg',
    coin: 'btc',
    address: addresses.btcAddress || 'bc1q00000000000000000000000000000000000000000000000000',
  },
]

type Props = {
  open: boolean
  onClose: () => void
  onSelectCryptoDepositWallet?: (wallet: DepositCryptoWallet) => void
}

export default function DepositCryptoWalletSheet({ open, onClose, onSelectCryptoDepositWallet }: Props) {
  const { profile } = useUserProfileStore()
  
  // Get wallets with addresses from profile
  const depositCryptoWallets = getDepositCryptoWallets({
    usdtSaAddress: profile.usdtSaAddress,
    usdtMznAddress: profile.usdtMznAddress,
    pepeAddress: profile.pepeAddress,
    ethAddress: profile.ethAddress,
    btcAddress: profile.btcAddress,
  })

  const handleSelect = (wallet: DepositCryptoWallet) => {
    if (onSelectCryptoDepositWallet) {
      onSelectCryptoDepositWallet(wallet)
    } else {
      // Stub for now
      console.log('Selected crypto deposit wallet:', wallet)
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
          onClick={() => handleSelect(wallet)}
          trailing={<ChevronRight size={24} strokeWidth={2} style={{ color: 'rgba(0, 0, 0, 0.4)' }} />}
        />
      ))}
    </ActionSheet>
  )
}

