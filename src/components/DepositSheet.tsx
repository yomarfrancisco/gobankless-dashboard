'use client'

import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'

type Props = {
  open: boolean
  onClose: () => void
  onSelect?: (method: 'bank' | 'card' | 'crypto' | 'email' | 'wallet' | 'brics') => void
  variant?: 'deposit' | 'direct-payment' // 'deposit' for Deposit button, 'direct-payment' for $ icon
}

export default function DepositSheet({ open, onClose, onSelect, variant = 'deposit' }: Props) {
  const handleSelect = (method: 'bank' | 'card' | 'crypto' | 'email' | 'wallet' | 'brics') => {
    if (onSelect) {
      onSelect(method)
    }
  }

  // Text content based on variant
  const title = variant === 'direct-payment' ? 'Direct USDT Payment' : 'Deposit method'
  
  const options = variant === 'direct-payment' 
    ? [
        {
          title: 'Email or Phone',
          caption: 'Send a link to pay via email or phone.',
          method: 'email' as const
        },
        {
          title: 'USDT Wallet',
          caption: 'Transfer to any wallet on Tron, Ethereum, or Solana.',
          method: 'wallet' as const
        },
        {
          title: 'BRICS Account',
          caption: 'Send to another BRICS or GoBankless user.',
          method: 'brics' as const
        }
      ]
    : [
        {
          title: 'Direct bank transfer',
          caption: 'Link your bank account. Deposits reflect in 2–3 days.',
          method: 'bank' as const
        },
        {
          title: 'Debit or Credit',
          caption: 'Link your card for instant deposits.',
          method: 'card' as const
        },
        {
          title: 'Crypto wallet',
          caption: 'Receive USDT directly from an external wallet.',
          method: 'crypto' as const
        }
      ]

  return (
    <ActionSheet open={open} onClose={onClose} title={title}>
      {options.map((option) => (
        <ActionSheetItem
          key={option.method}
          iconSrc="/assets/up right.svg"
          title={option.title}
          caption={option.caption}
          onClick={() => handleSelect(option.method)}
        />
      ))}
    </ActionSheet>
  )
}

