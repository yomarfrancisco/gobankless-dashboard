'use client'

import { useFinancialInboxStore } from '@/state/financialInbox'
import ActionSheet from './ActionSheet'
import InboxList from './Inbox/InboxList'
import DirectMessage from './Inbox/DirectMessage'

export default function InboxSheet() {
  const { isInboxOpen, activeThreadId, closeInbox } = useFinancialInboxStore()

  // Determine which view to show
  const showDM = activeThreadId !== null

  return (
    <ActionSheet
      open={isInboxOpen}
      onClose={closeInbox}
      title={showDM ? '' : 'Inbox'} // Empty string hides title for DM view, shows "Inbox" for list
      size="tall" // Use tall size to match deposit sheet height
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

