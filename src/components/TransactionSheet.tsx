'use client'

import { HandCoins } from 'lucide-react'
import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'

type Props = {
  open: boolean
  onClose: () => void
  onSelect?: (action: 'deposit' | 'withdraw' | 'payment') => void
}

export default function TransactionSheet({ open, onClose, onSelect }: Props) {
  const handleSelect = (action: 'deposit' | 'withdraw' | 'payment') => {
    if (onSelect) {
      onSelect(action)
    }
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="Transact">
      <ActionSheetItem
        iconSrc="/assets/up right.svg"
        title="Deposit"
        onClick={() => handleSelect('deposit')}
      />
      <ActionSheetItem
        iconSrc="/assets/down-left.svg"
        title="Withdraw"
        onClick={() => handleSelect('withdraw')}
      />
      <ActionSheetItem
        icon={<HandCoins size={22} strokeWidth={2} />}
        title="Payment"
        onClick={() => handleSelect('payment')}
      />
    </ActionSheet>
  )
}

