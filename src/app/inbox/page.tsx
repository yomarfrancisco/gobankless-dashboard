'use client'

import { useEffect } from 'react'
import { useFinancialInboxStore } from '@/state/financialInbox'
import { FinancialInboxSheet } from '@/components/Inbox/FinancialInboxSheet'

export default function InboxPage() {
  const { openInbox } = useFinancialInboxStore()

  // Auto-open inbox and navigate to Portfolio Manager on page load
  useEffect(() => {
    openInbox('portfolio-manager')
  }, [openInbox])

  return <FinancialInboxSheet />
}

