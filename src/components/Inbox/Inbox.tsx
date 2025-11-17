'use client'

import { useFinancialInboxStore } from '@/state/financialInbox'
import ActionSheet from '../ActionSheet'
import InboxList from './InboxList'
import DirectMessage from './DirectMessage'

/**
 * Financial Inbox component using the same bottom sheet format as Deposit Method
 * Slides up from bottom, matches Deposit sheet height/rounded corners
 */
export default function Inbox() {
  const { isInboxOpen, activeThreadId, closeInbox } = useFinancialInboxStore()

  // Determine which view to show
  const showDM = activeThreadId !== null

  return (
    <ActionSheet
      open={isInboxOpen}
      onClose={closeInbox}
      title={showDM ? '' : 'Inbox'} // Empty string hides title for DM view, shows "Inbox" for list
      size="tall" // Use tall size (85vh) to match deposit sheet height
      className="inbox-sheet"
    >
      {showDM ? (
        <DirectMessage threadId={activeThreadId} />
      ) : (
        <InboxList />
      )}
    </ActionSheet>
  )
}

