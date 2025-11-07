'use client'

import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'

type Props = {
  open: boolean
  onClose: () => void
  onSelect?: (method: 'email-phone' | 'wallet' | 'brics') => void
}

export default function DirectPaymentSheet({ open, onClose, onSelect }: Props) {
  const handleSelect = (method: 'email-phone' | 'wallet' | 'brics') => {
    if (onSelect) {
      onSelect(method)
    }
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="Direct Payment">
      <div style={{ padding: '0 24px 16px 24px' }}>
        <div className="as-title" style={{ marginBottom: '8px' }}>Direct USDT Payment</div>
      </div>
      <ActionSheetItem
        iconSrc="/assets/up right.svg"
        title="Pay to Email or Phone"
        caption="Send a payment link directly to someone's email or phone. The recipient can claim USDT instantly — no wallet required."
        onClick={() => handleSelect('email-phone')}
      />
      <ActionSheetItem
        iconSrc="/assets/up right.svg"
        title="Pay to USDT Wallet"
        caption="Send USDT directly to any wallet on Tron, Ethereum, or Solana networks."
        onClick={() => handleSelect('wallet')}
      />
      <ActionSheetItem
        iconSrc="/assets/up right.svg"
        title="Pay to BRICS Account"
        caption="Instantly transfer to an existing BRICS or GoBankless user via their account handle."
        onClick={() => handleSelect('brics')}
      />
    </ActionSheet>
  )
}

