'use client'

import ActionSheet from './ActionSheet'
import ActionSheetItem from './ActionSheetItem'

type Props = { open: boolean; onClose: () => void }

export default function DepositSheet({ open, onClose }: Props) {
  return (
    <ActionSheet open={open} onClose={onClose} title="Deposit method">
      <ActionSheetItem
        iconSrc="/assets/up right.svg"
        title="Direct bank transfer"
        caption="Link your bank account. Deposits reflect in 2–3 days."
        onClick={() => {
          /* route or open sub-flow */
        }}
      />
      <ActionSheetItem
        iconSrc="/assets/up right.svg"
        title="Debit or Credit"
        caption="Link your card for instant deposits."
        onClick={() => {
          /* route or open sub-flow */
        }}
      />
      <ActionSheetItem
        iconSrc="/assets/up right.svg"
        title="Crypto wallet"
        caption="Receive USDT directly from an external wallet."
        onClick={() => {
          /* route or open sub-flow */
        }}
      />
    </ActionSheet>
  )
}

