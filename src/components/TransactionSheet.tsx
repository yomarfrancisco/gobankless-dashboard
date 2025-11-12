'use client'

import { HandCoins, BanknoteArrowUp, BanknoteArrowDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'
import TransferCardsIcon from './TransferCardsIcon'

type Props = {
  open: boolean
  onClose: () => void
  onSelect?: (action: 'deposit' | 'withdraw' | 'payment' | 'transfer') => void
}

export default function TransactionSheet({ open, onClose, onSelect }: Props) {
  const router = useRouter()
  
  const handleSelect = (action: 'deposit' | 'withdraw' | 'payment' | 'transfer') => {
    if (action === 'transfer') {
      onClose()
      router.push('/transfer')
    } else if (onSelect) {
      onSelect(action)
    }
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="Transact">
      <ActionSheetItem
        icon={<BanknoteArrowUp size={22} strokeWidth={2} />}
        title="Deposit"
        caption="Add funds instantly via card or bank transfer"
        onClick={() => handleSelect('deposit')}
      />
      <ActionSheetItem
        icon={<BanknoteArrowDown size={22} strokeWidth={2} />}
        title="Withdraw"
        caption="Move funds back to your bank account or external wallet"
        onClick={() => handleSelect('withdraw')}
      />
      <ActionSheetItem
        icon={<HandCoins size={22} strokeWidth={2} />}
        title="Payment"
        caption="Pay anyone via email, handle, or wallet"
        onClick={() => handleSelect('payment')}
      />
      <ActionSheetItem
        icon={<TransferCardsIcon />}
        title="Transfer"
        caption="Transfer funds between your various fiat and crypto wallets."
        onClick={() => handleSelect('transfer')}
        ariaLabel="Transfer funds between wallets"
      />
    </ActionSheet>
  )
}

