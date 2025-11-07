'use client'

import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'

type Props = {
  open: boolean
  onClose: () => void
  onSelect?: (method: 'bank' | 'card' | 'crypto') => void
}

export default function DepositSheet({ open, onClose, onSelect }: Props) {
  const handleSelect = (method: 'bank' | 'card' | 'crypto') => {
    if (onSelect) {
      onSelect(method)
    }
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="Deposit method">
      <ActionSheetItem
        iconSrc="/assets/up right.svg"
        title="Direct bank transfer"
        caption="Link your bank account. Deposits reflect in 2–3 days."
        onClick={() => handleSelect('bank')}
      />
      <ActionSheetItem
        iconSrc="/assets/up right.svg"
        title="Debit or Credit"
        caption="Link your card for instant deposits."
        onClick={() => handleSelect('card')}
      />
      <ActionSheetItem
        iconSrc="/assets/up right.svg"
        title="Crypto wallet"
        caption="Receive USDT directly from an external wallet."
        onClick={() => handleSelect('crypto')}
      />
    </ActionSheet>
  )
}

