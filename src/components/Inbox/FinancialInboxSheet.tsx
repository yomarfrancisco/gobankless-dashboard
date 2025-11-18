'use client'

import Image from 'next/image'
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
      name: '$BRICS Diamond',
      avatar: '/assets/Brics-girl-blue.png',
      preview: 'Longer reply. Assess borrower risk and price accordingly via lender-specific interest rates. Receive a return on deposited capital even if funds are not drawn down. Withdraw deposited capital on-demand if funds aren\'t drawn down by a Borrower.',
      time: '16:09',
      unread: true,
    },
    {
      id: 'user-1',
      name: '$kerry',
      avatar: '/assets/avatar - profile (1).png',
      preview: 'Message received by me from another user going into two lines',
      time: '15:30',
      unread: false,
    },
    {
      id: 'user-2',
      name: '$simi_love',
      avatar: '/assets/avatar - profile (2).png',
      preview: 'Media with caption sent by me to another user...',
      time: '14:45',
      unread: false,
    },
    {
      id: 'user-3',
      name: '$ariel',
      avatar: '/assets/avatar - profile (3).png',
      preview: 'Photo',
      time: '13:20',
      unread: false,
    },
    {
      id: 'user-4',
      name: '$dana',
      avatar: '/assets/avatar - profile (4).png',
      preview: 'Video',
      time: '12:15',
      unread: false,
    },
    {
      id: 'user-5',
      name: '$thando',
      avatar: '/assets/avatar - profile (5).png',
      preview: 'File',
      time: '11:00',
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
  const sheetTitle = inboxViewMode === 'inbox' ? 'Collectives' : ''

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
            <p className={listStyles.subtitle}>Join communities saving toward shared goals.</p>
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
                placeholder="Search inbox"
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
          <div className={listStyles.stickyButtonContainer}>
            <button
              className={listStyles.launchMissionButton}
              onClick={() => {
                console.log('Launch a Mission clicked')
                // TODO: implement launch mission flow
              }}
              type="button"
            >
              Launch a Mission
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
                alt="$BRICS Diamond"
                width={38}
                height={38}
                className={chatStyles.avatarImage}
                unoptimized
              />
            </div>
            <div className={chatStyles.name}>$BRICS Diamond</div>
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
                  Longer reply. Assess borrower risk and price accordingly via lender-specific interest rates. Receive a return on deposited capital even if funds are not drawn down. Withdraw deposited capital on-demand if funds aren&apos;t drawn down by a Borrower.
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

