'use client'

import { useEffect, useState, useRef, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './BottomSheet.module.css'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  height?: number | string
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = 576,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const touchCurrentY = useRef<number>(0)
  const isDragging = useRef<boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // Prevent background scroll
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      // Focus close button for accessibility
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    } else {
      // Start exit animation
      setIsAnimating(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleAnimationEnd = () => {
      if (!isOpen) {
        // Restore scroll after exit animation completes
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
      }
    }

    document.addEventListener('keydown', handleEscape)
    const sheet = sheetRef.current
    if (sheet) {
      sheet.addEventListener('transitionend', handleAnimationEnd)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      if (sheet) {
        sheet.removeEventListener('transitionend', handleAnimationEnd)
      }
    }
  }, [isOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (sheetRef.current && sheetRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
      isDragging.current = true
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return

    touchCurrentY.current = e.touches[0].clientY
    const deltaY = touchCurrentY.current - touchStartY.current

    if (deltaY > 0) {
      sheetRef.current.style.transform = `translateX(-50%) translateY(${deltaY}px)`
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging.current || !sheetRef.current) return

    const deltaY = touchCurrentY.current - touchStartY.current
    isDragging.current = false

    if (deltaY > 80) {
      onClose()
    } else {
      sheetRef.current.style.transform = 'translateX(-50%) translateY(0)'
    }
  }

  if (!mounted) return null

  // Render even when closing to allow exit animation
  if (!isOpen && !isAnimating) return null

  const sheetHeight = typeof height === 'number' ? `${height}px` : height

  return createPortal(
    <div
      className={`${styles.backdrop} ${isAnimating ? styles.enterActive : styles.exitActive}`}
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        ref={sheetRef}
        className={`${styles.sheet} ${isAnimating ? styles.enterActive : styles.exitActive}`}
        style={{ height: sheetHeight }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>,
    document.body
  )
}

