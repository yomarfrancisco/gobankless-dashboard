'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './DirectMessage.module.css'

type ChatMessage = {
  id: string
  from: 'user' | 'ai'
  text: string
  createdAt: string // e.g. '14:09'
}

type DirectMessageProps = {
  onBack?: () => void
}

export default function DirectMessage({ onBack }: DirectMessageProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      from: 'user',
      text: 'Sent a direct message',
      createdAt: '14:09',
    },
    {
      id: '2',
      from: 'ai',
      text: 'Reply to direct message',
      createdAt: '14:09',
    },
    {
      id: '3',
      from: 'ai',
      text: 'Longer reply. Assess borrower risk and price accordingly via lender-specific interest rates. Receive a return on deposited capital even if funds are not drawn down. Withdraw deposited capital on-demand if funds are not drawn down by a Borrower.',
      createdAt: '14:09',
    },
  ])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      from: 'user',
      text: inputText.trim(),
      createdAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputText('')

    // Add stub AI reply after delay
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: "Got it. I'll walk you through what changed in your portfolio in the last 24h in the next iteration.",
        createdAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 700)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push('/')
    }
  }

  return (
    <div className={styles.directMessage}>
      <div className={styles.frameParent}>
        {messages.map((message, index) => {
          // Show date chip before first message
          const showDateChip = index === 0
          
          return (
            <div key={message.id}>
              {showDateChip && (
                <div className={styles.component1}>
                  <div className={styles.dealerHasAccepted}>Wed, 27 Feb</div>
                </div>
              )}
              
              {message.from === 'user' ? (
                <div className={styles.frameWrapper}>
                  <div className={styles.dmMessageParent}>
                    <div className={styles.dmMessage}>
                      <div className={styles.description}>
                        <div className={styles.dealerHasAccepted}>{message.text}</div>
                      </div>
                    </div>
                    <div className={styles.dmTimestamp}>
                      <div className={styles.dealerHasAccepted}>{message.createdAt}</div>
                      <Image
                        className={styles.ico24UiAllDone}
                        src="/assets/all_done.svg"
                        alt="Delivered"
                        width={16}
                        height={16}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.avatarDmParent}>
                  <div className={styles.avatarDm}>
                    <Image
                      className={styles.appIcon}
                      src="/assets/Brics-girl-blue.png"
                      alt="BabyCDO"
                      width={32}
                      height={32}
                      unoptimized
                    />
                  </div>
                  <div className={message.text.length > 100 ? styles.dmMessageContainer : styles.dmMessageGroup}>
                    <div className={message.text.length > 100 ? styles.dmMessage2 : styles.directMessageDmMessage}>
                      <div className={message.text.length > 100 ? styles.description2 : styles.description}>
                        <div className={message.text.length > 100 ? styles.dealerHasAccepted2 : styles.dealerHasAccepted}>
                          {message.text}
                        </div>
                      </div>
                    </div>
                    <div className={message.text.length > 100 ? styles.directMessageTime : styles.time}>
                      <div className={styles.dealerHasAccepted}>{message.createdAt}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className={styles.commentInput}>
        <form className={styles.inputAndIcons} onSubmit={handleSend}>
          <Image
            className={styles.ico24UiAttachmentDia}
            src="/assets/attachment_diagonal.svg"
            alt="Attach"
            width={24}
            height={24}
          />
          <input
            type="text"
            className={styles.button}
            placeholder="Add a message"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          {inputText.trim() && (
            <button
              type="submit"
              className={styles.sendButton}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </form>
      </div>

      {/* HEADER */}
      <div className={styles.messageHeader}>
        <button onClick={handleBack} className={styles.backButton} aria-label="Back">
          <Image
            className={styles.ico24ArrowsBackUi}
            src="/assets/back_ui.svg"
            alt="Back"
            width={24}
            height={24}
          />
        </button>
        <div className={styles.profileHeader}>
          <Image
            className={styles.avatarProfile}
            src="/assets/Brics-girl-blue.png"
            alt="BabyCDO"
            width={32}
            height={32}
            unoptimized
          />
          <div className={styles.usernameProfileWrapper}>
            <div className={styles.usernameProfile}>
              <div className={styles.textInput}>
                <div className={styles.text}>BabyCDO</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

