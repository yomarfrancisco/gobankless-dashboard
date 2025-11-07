'use client'

import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'

type Props = { open: boolean; onClose: () => void }

export default function WithdrawSheet({ open, onClose }: Props) {
  return (
    <ActionSheet open={open} onClose={onClose} title="Withdraw method">
      <ActionSheetItem
        iconSrc="/assets/down-left.svg"
        title="Bank account"
        caption="Send ZAR to your linked bank account."
        onClick={() => {
          /* route or open sub-flow */
        }}
      />
      <ActionSheetItem
        iconSrc="/assets/down-left.svg"
        title="Debit/Credit reversal"
        caption="Refund to your linked card if supported."
        onClick={() => {
          /* route or open sub-flow */
        }}
      />
      <ActionSheetItem
        iconSrc="/assets/down-left.svg"
        title="External crypto wallet"
        caption="Send USDT to an external wallet."
        onClick={() => {
          /* route or open sub-flow */
        }}
      />
    </ActionSheet>
  )
}

