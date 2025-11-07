'use client'

import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'

type Props = {
  open: boolean
  onClose: () => void
  onSelect?: (method: 'bank' | 'card' | 'crypto') => void
}

export default function WithdrawSheet({ open, onClose, onSelect }: Props) {
  const handleSelect = (method: 'bank' | 'card' | 'crypto') => {
    if (onSelect) {
      onSelect(method)
    }
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="Withdraw method">
      <ActionSheetItem
        iconSrc="/assets/down-left.svg"
        title="Bank account"
        caption="Send ZAR to your linked bank account."
        onClick={() => handleSelect('bank')}
      />
      <ActionSheetItem
        iconSrc="/assets/down-left.svg"
        title="Debit/Credit reversal"
        caption="Refund to your linked card if supported."
        onClick={() => handleSelect('card')}
      />
      <ActionSheetItem
        iconSrc="/assets/down-left.svg"
        title="External crypto wallet"
        caption="Send USDT to an external wallet."
        onClick={() => handleSelect('crypto')}
      />
    </ActionSheet>
  )
}

