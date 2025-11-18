'use client'

import Image from 'next/image'
import { CirclePlus } from 'lucide-react'
import ActionSheet from '../ActionSheet'
import { useFinancialInboxStore } from '@/state/financialInbox'
import listStyles from './FinancialInboxListSheet.module.css'
import chatStyles from './FinancialInboxChatSheet.module.css'

/**
 * Unified Financial Inbox Sheet - switches between inbox list and chat view
 * Single ActionSheet that changes content based on inboxViewMode
 */
export default function FinancialInboxSheet() {
  const { 
    isInboxOpen, 
    inboxViewMode, 
    closeInbox, 
    openChatSheet,
    goBackToInbox 
  } = useFinancialInboxStore()

  // Mock conversation data (same as in ListSheet)
  const conversations = [
    {
      id: 'brics',
      name: 'Ama — Stokvel Treasurer',
      avatar: '/assets/Brics-girl-blue.png',
      preview: 'Welcome! I can help you join or start a Stokvel.',
      time: '16:09',
      unread: true,
    },
    {
      id: 'user-1',
      name: 'Sandton Side-Hustle Fund',
      avatar: '/assets/avatar - profile (1).png',
      preview: '9 members • Goal: R5,000 weekly gig capital',
      time: '15:30',
      unread: false,
    },
    {
      id: 'user-2',
      name: 'Creators Equipment Club',
      avatar: '/assets/avatar - profile (2).png',
      preview: '13 members • Goal: Camera & studio gear',
      time: '14:45',
      unread: false,
    },
    {
      id: 'user-3',
      name: 'Student Essentials Stokvel',
      avatar: '/assets/avatar - profile (3).png',
      preview: '7 members • Goal: Textbooks & transport',
      time: '13:20',
      unread: false,
    },
    {
      id: 'user-4',
      name: 'December Travel Pot',
      avatar: '/assets/avatar - profile (4).png',
      preview: '11 members • Goal: Year-end holiday savings',
      time: '12:15',
      unread: false,
    },
  ]

  const handleRowClick = (id: string) => {
    if (id === 'brics') {
      openChatSheet('portfolio-manager')
    }
    // Other rows are static for now
  }

  // Determine title based on view mode
  const sheetTitle = inboxViewMode === 'inbox' ? 'Stokvels around you' : ''

  return (
    <ActionSheet
      open={isInboxOpen}
      onClose={closeInbox}
      title={sheetTitle}
      size="tall"
      className={listStyles.financialInboxSheet}
    >
      {inboxViewMode === 'inbox' ? (
        // Inbox list view
        <>
          <div className={listStyles.content}>
            <p className={listStyles.subtitle}>Explore real groups with real goals — pick one that matches you.</p>
            <div className={listStyles.divider} />
            
            {/* Search bar */}
            <div className={listStyles.searchBar}>
              <div className={listStyles.searchIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="text"
                className={listStyles.searchInput}
                placeholder="Search Stokvels"
              />
            </div>

            {/* Conversation list - scrollable */}
            <div className={listStyles.conversationList}>
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={listStyles.inboxRow}
                  onClick={() => handleRowClick(conversation.id)}
                  type="button"
                >
                  <div className={listStyles.inboxRowLeft}>
                    <div className={listStyles.avatarWrapper}>
                      <Image
                        src={conversation.avatar}
                        alt={conversation.name}
                        width={64}
                        height={64}
                        className={listStyles.avatar}
                        unoptimized
                      />
                    </div>
                    <div className={listStyles.inboxTextBlock}>
                      <div className={listStyles.inboxHeader}>
                        <div className={listStyles.inboxTitle}>{conversation.name}</div>
                        <div className={listStyles.inboxTimeRow}>
                          <div className={listStyles.inboxTime}>{conversation.time}</div>
                          {conversation.unread && (
                            <div className={listStyles.unreadDot} />
                          )}
                        </div>
                      </div>
                      <div className={listStyles.inboxPreview}>
                        {conversation.preview}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sticky bottom button - positioned relative to as-body */}
          <div className={listStyles.modalFooter}>
            <button
              className={listStyles.launchButton}
              onClick={() => {
                console.log('Launch clicked')
                // TODO: implement launch mission flow
              }}
              type="button"
            >
              <CirclePlus className={listStyles.launchIcon} />
              <span>Start a Stokvel</span>
            </button>
          </div>
        </>
      ) : (
        // Chat view
        <div className={chatStyles.container}>
          {/* Username row - no separate close button row, ActionSheet provides the close button */}
          <div className={chatStyles.usernameRow}>
            <button className={chatStyles.backButton} onClick={goBackToInbox} aria-label="Back">
              <Image
                src="/assets/back_ui.svg"
                alt="Back"
                width={24}
                height={24}
              />
            </button>
            <div className={chatStyles.avatar}>
              <Image
                src="/assets/Brics-girl-blue.png"
                alt="Ama — Stokvel Treasurer"
                width={38}
                height={38}
                className={chatStyles.avatarImage}
                unoptimized
              />
            </div>
            <div className={chatStyles.name}>Ama — Stokvel Treasurer</div>
          </div>

          {/* Divider line */}
          <div className={chatStyles.divider} />

          {/* Message area */}
          <div className={chatStyles.messageArea}>
            <div className={chatStyles.messageWrapper}>
              <div className={chatStyles.messageAvatar}>
                <Image
                  src="/assets/Brics-girl-blue.png"
                  alt="Baby Diamond"
                  width={31}
                  height={31}
                  className={chatStyles.messageAvatarImage}
                  unoptimized
                />
              </div>
              <div className={chatStyles.bubbleContainer}>
                <div className={chatStyles.messageBubble}>
                  Hi, I&apos;m Ama, your Stokvel Treasurer 👋   I can help you make your first deposit, join a Stokvel, or start a new group with friends.   What would you like to do first?
                </div>
                <div className={chatStyles.timestamp}>14:09</div>
              </div>
            </div>
          </div>

          {/* Input bar - no divider line above */}
          <div className={chatStyles.inputBar}>
            <button className={chatStyles.attachButton} aria-label="Attach">
              <Image
                src="/assets/attachment_diagonal.svg"
                alt="Attach"
                width={24}
                height={24}
              />
            </button>
            <input
              type="text"
              className={chatStyles.input}
              placeholder="Add a message"
            />
          </div>
        </div>
      )}
    </ActionSheet>
  )
}

