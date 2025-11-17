/**
 * Financial Inbox State
 * Manages threads and messages for the financial inbox system
 */

import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type ThreadId = string

export type Thread = {
  id: ThreadId
  title: string
  subtitle: string
  avatarUrl: string
  unreadCount: number
  lastMessageAt: string // ISO or "14:09"
  kind: 'portfolio_manager' | 'peer'
}

export type ChatMessage = {
  id: string
  threadId: ThreadId
  from: 'user' | 'ai'
  text: string
  createdAt: string
}

type FinancialInboxState = {
  threads: Thread[]
  messagesByThreadId: Record<ThreadId, ChatMessage[]>
  activeThreadId: ThreadId | null
  isInboxOpen: boolean
  openInbox: (threadId?: ThreadId) => void
  closeInbox: () => void
  sendMessage: (threadId: ThreadId, from: 'user' | 'ai', text: string) => void
  setActiveThread: (threadId: ThreadId | null) => void
  ensurePortfolioManagerThread: () => void
}

const PORTFOLIO_MANAGER_THREAD_ID = 'portfolio-manager'

// Initial seed messages for Portfolio Manager
const initialPMMessages: ChatMessage[] = [
  {
    id: nanoid(),
    threadId: PORTFOLIO_MANAGER_THREAD_ID,
    from: 'user',
    text: 'Sent a direct message',
    createdAt: '14:09',
  },
  {
    id: nanoid(),
    threadId: PORTFOLIO_MANAGER_THREAD_ID,
    from: 'ai',
    text: 'Reply to direct message',
    createdAt: '14:09',
  },
  {
    id: nanoid(),
    threadId: PORTFOLIO_MANAGER_THREAD_ID,
    from: 'ai',
    text: 'Longer reply. Assess borrower risk and price accordingly via lender-specific interest rates. Receive a return on deposited capital even if funds are not drawn down. Withdraw deposited capital on-demand if funds are not drawn down by a Borrower.',
    createdAt: '14:09',
  },
]

export const useFinancialInboxStore = create<FinancialInboxState>((set, get) => ({
  threads: [
    {
      id: PORTFOLIO_MANAGER_THREAD_ID,
      title: '$BRICS Diamond',
      subtitle: 'Longer reply. Assess borrower risk and price accordingly via lender-specific interest rates...',
      avatarUrl: '/assets/Brics-girl-blue.png',
      unreadCount: 0,
      lastMessageAt: '14:09',
      kind: 'portfolio_manager',
    },
  ],
  messagesByThreadId: {
    [PORTFOLIO_MANAGER_THREAD_ID]: initialPMMessages,
  },
  activeThreadId: null,
  isInboxOpen: false,

  ensurePortfolioManagerThread: () => {
    const state = get()
    const pmThread = state.threads.find((t) => t.id === PORTFOLIO_MANAGER_THREAD_ID)
    if (!pmThread) {
      set((state) => ({
        threads: [
          {
            id: PORTFOLIO_MANAGER_THREAD_ID,
            title: '$BRICS Diamond',
            subtitle: 'Portfolio Manager',
            avatarUrl: '/assets/Brics-girl-blue.png',
            unreadCount: 0,
            lastMessageAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            kind: 'portfolio_manager',
          },
          ...state.threads,
        ],
      }))
    }
    if (!state.messagesByThreadId[PORTFOLIO_MANAGER_THREAD_ID]) {
      set((state) => ({
        messagesByThreadId: {
          ...state.messagesByThreadId,
          [PORTFOLIO_MANAGER_THREAD_ID]: initialPMMessages,
        },
      }))
    }
  },

  openInbox: (threadId?: ThreadId) => {
    const state = get()
    state.ensurePortfolioManagerThread()
    
    set({
      isInboxOpen: true,
      activeThreadId: threadId || PORTFOLIO_MANAGER_THREAD_ID,
    })
  },

  closeInbox: () => {
    set({
      isInboxOpen: false,
      activeThreadId: null,
    })
  },

  setActiveThread: (threadId: ThreadId | null) => {
    set({ activeThreadId: threadId })
  },

  sendMessage: (threadId: ThreadId, from: 'user' | 'ai', text: string) => {
    const state = get()
    const message: ChatMessage = {
      id: nanoid(),
      threadId,
      from,
      text,
      createdAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }

    // Add message to thread
    const threadMessages = state.messagesByThreadId[threadId] || []
    set({
      messagesByThreadId: {
        ...state.messagesByThreadId,
        [threadId]: [...threadMessages, message],
      },
    })

    // Update thread subtitle and timestamp
    const thread = state.threads.find((t) => t.id === threadId)
    if (thread) {
      const updatedThreads = state.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              subtitle: text.length > 60 ? text.substring(0, 60) + '...' : text,
              lastMessageAt: message.createdAt,
              unreadCount: from === 'ai' ? t.unreadCount + 1 : t.unreadCount,
            }
          : t
      )
      set({ threads: updatedThreads })
    }
  },
}))

