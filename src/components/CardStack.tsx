'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import type React from 'react'
import type { StaticImageData } from 'next/image'
import gobCardImage from '../../public/assets/cards/card-GOB3.jpg'
import { CARD_FLIP_CLASSES } from '@/lib/animations/cardFlipClassNames'
import { DEV_CARD_FLIP_DEBUG } from '@/lib/flags'
import { FLIP_MS } from '@/lib/animations/useAiActionCycle'
import { useWalletAlloc } from '@/state/walletAlloc'
import { getStackStyle } from '@/lib/stack/getStackStyle'
import CardStackCard from './CardStackCard'

// Temporary FX rate (will be wired to real API later)
const FX_USD_ZAR_DEFAULT = 18.1

// Health levels: 'good' | 'moderate' | 'fragile'
type HealthLevel = 'good' | 'moderate' | 'fragile'

// Health configuration per card type
const HEALTH_CONFIG: Record<CardType, { level: HealthLevel; percent: number }> = {
  savings: { level: 'good', percent: 100 },
  pepe: { level: 'fragile', percent: 25 },
  yield: { level: 'moderate', percent: 60 },
  mzn: { level: 'good', percent: 100 },
}

type CardType = 'pepe' | 'savings' | 'yield' | 'mzn'

interface CardData {
  type: CardType
  image: string | StaticImageData
  alt: string
  width: number
  height: number
}

const cardsData: CardData[] = [
  {
    type: 'savings',
    image: '/assets/cards/card-savings.jpg',
    alt: 'Savings Card',
    width: 342,
    height: 213,
  },
  {
    type: 'pepe',
    image: '/assets/cards/card-pepe.jpg',
    alt: 'PEPE Card',
    width: 398,
    height: 238,
  },
  {
    type: 'yield',
    image: gobCardImage,
    alt: 'Yield Card',
    width: 310,
    height: 193,
  },
  {
    type: 'mzn',
    image: '/assets/cards/card-MZN.jpg',
    alt: 'MZN Cash Card',
    width: 342,
    height: 213,
  },
]

// Card labels mapping
const CARD_LABELS: Record<CardType, string> = {
  savings: 'CASH CARD',
  pepe: 'PEPE CARD',
  yield: 'ETH CARD',
  mzn: 'CASH CARD',
}

// Map card type to allocation key
const CARD_TO_ALLOC_KEY: Record<CardType, 'cashCents' | 'ethCents' | 'pepeCents' | 'mznCents'> = {
  savings: 'cashCents',
  pepe: 'pepeCents',
  yield: 'ethCents',
  mzn: 'mznCents',
}

// Map card type to portfolio symbol
const CARD_TO_SYMBOL: Record<CardType, 'CASH' | 'ETH' | 'PEPE' | 'MZN'> = {
  savings: 'CASH',
  pepe: 'PEPE',
  yield: 'ETH',
  mzn: 'MZN',
}

interface CardStackProps {
  onTopCardChange?: (cardType: CardType) => void
  flipControllerRef?: React.MutableRefObject<{ pause: () => void; resume: () => void } | null>
}

export type CardStackHandle = {
  cycleNext: () => void
  flipToCard: (cardType: CardType, direction?: 'forward' | 'back') => Promise<void>
}

const FLIP_DURATION_MS = FLIP_MS

const CardStack = forwardRef<CardStackHandle, CardStackProps>(function CardStack({ onTopCardChange, flipControllerRef: externalFlipControllerRef }, ref) {
  // Dynamic order initialization based on cards.length
  const initialOrder = Array.from({ length: cardsData.length }, (_, i) => i)
  const [order, setOrder] = useState<number[]>(initialOrder)
  const [isAnimating, setIsAnimating] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'animating'>('idle')
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)

  // Flash state: track direction for each card type
  // Note: alloc values are now read in CardStackCard component
  const { alloc } = useWalletAlloc()
  const [flashDirection, setFlashDirection] = useState<Record<CardType, 'up' | 'down' | null>>({
    savings: null,
    pepe: null,
    yield: null,
    mzn: null,
  })
  // Track previous values to compute direction
  const prevValuesRef = useRef<Record<CardType, number>>({
    savings: alloc.cashCents / 100,
    pepe: alloc.pepeCents / 100,
    yield: alloc.ethCents / 100,
    mzn: (alloc as any).mznCents ? (alloc as any).mznCents / 100 : 0,
  })

  // Compute flash direction when values change
  useEffect(() => {
    const currentValues: Record<CardType, number> = {
      savings: alloc.cashCents / 100,
      pepe: alloc.pepeCents / 100,
      yield: alloc.ethCents / 100,
      mzn: (alloc as any).mznCents ? (alloc as any).mznCents / 100 : 0,
    }

    const newFlashDirection: Record<CardType, 'up' | 'down' | null> = {
      savings: null,
      pepe: null,
      yield: null,
      mzn: null,
    }

    // Compute direction for each card
    ;(['savings', 'pepe', 'yield', 'mzn'] as CardType[]).forEach((cardType) => {
      const prev = prevValuesRef.current[cardType]
      const current = currentValues[cardType]
      const delta = current - prev

      // Debounce tiny changes (less than half a cent)
      if (Math.abs(delta) < 0.005) {
        newFlashDirection[cardType] = null
      } else if (delta > 0) {
        newFlashDirection[cardType] = 'up'
      } else if (delta < 0) {
        newFlashDirection[cardType] = 'down'
      }

      // Update previous value AFTER computing direction
      // (so next change can compare against this value)
      prevValuesRef.current[cardType] = current
    })

    // Update flash direction state (this triggers re-render with flash classes)
    setFlashDirection(newFlashDirection)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alloc.cashCents, alloc.pepeCents, alloc.ethCents, (alloc as any).mznCents])

  // Notify parent of top card change
  useEffect(() => {
    if (onTopCardChange) {
      const topCardIndex = order[0]
      const topCard = cardsData[topCardIndex]
      if (topCard) {
        onTopCardChange(topCard.type)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order])

  // Get card index by type
  const getCardIndex = useCallback((cardType: CardType): number => {
    return cardsData.findIndex((c) => c.type === cardType)
  }, [])

  // Flip to a specific card type
  const flipToCard = useCallback(
    async (targetCardType: CardType, direction: 'forward' | 'back' = 'forward'): Promise<void> => {
      const targetIndex = getCardIndex(targetCardType)
      if (targetIndex === -1) return

      const currentTopIndex = order[0]
      if (currentTopIndex === targetIndex) {
        return // Already on top
      }

      // Find target position in current order
      const targetPosition = order.indexOf(targetIndex)

      // If target is already top, no flip needed
      if (targetPosition === 0) return

      // Calculate how many cycles needed
      let cyclesNeeded = targetPosition

      return new Promise((resolve) => {
        const performCycle = (remaining: number) => {
          if (remaining === 0) {
            resolve()
            return
          }

          if (isAnimating) {
            // Wait for current animation to finish
            setTimeout(() => performCycle(remaining), FLIP_DURATION_MS + 50)
            return
          }

          setIsAnimating(true)
          setPhase('animating')

          setTimeout(() => {
            setOrder((prevOrder) => [...prevOrder.slice(1), prevOrder[0]])
            setPhase('idle')
            setIsAnimating(false)

            // Continue with next cycle if needed
            if (remaining > 1) {
              setTimeout(() => performCycle(remaining - 1), 50)
            } else {
              resolve()
            }
          }, FLIP_DURATION_MS)
        }

        performCycle(cyclesNeeded)
      })
    },
    [order, isAnimating, getCardIndex]
  )

  const cycle = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setPhase('animating')

    setTimeout(() => {
      setOrder((prevOrder) => [...prevOrder.slice(1), prevOrder[0]])
      setPhase('idle')
      setIsAnimating(false)
    }, FLIP_DURATION_MS)
  }

  // Expose cycleNext for external control
  const cycleNext = () => {
    cycle()
  }

  useImperativeHandle(ref, () => ({
    cycleNext,
    flipToCard,
  }))

  const handleCardClick = (index: number) => {
    // Only respond if this card is the top card (order[0])
    if (order[0] === index && !isAnimating) {
      cycle()
    }
  }

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (order[0] === index) {
      touchStartY.current = e.touches[0].clientY
    }
  }

  const handleTouchEnd = (e: React.TouchEvent, index: number) => {
    if (order[0] === index) {
      touchEndY.current = e.changedTouches[0].clientY
      const swipeDistance = touchStartY.current - touchEndY.current
      const minSwipeDistance = 50

      // Swipe up detected
      if (swipeDistance > minSwipeDistance && !isAnimating) {
        cycle()
      }
    }
  }

  const getCardClasses = (index: number, depth: number) => {
    const isTop = depth === 0
    const isCyclingOut = isTop && phase === 'animating'

    // During animation, cards move up one position
    const effectiveDepth = phase === 'animating' && depth > 0 ? depth - 1 : depth

    // Use computed styles instead of hardcoded classes
    // Keep base card class for transitions and hover effects
    return `${CARD_FLIP_CLASSES.card} ${isCyclingOut ? CARD_FLIP_CLASSES.cyclingOut : ''} ${!isTop ? CARD_FLIP_CLASSES.noHover : ''}`
  }

  // Debug logging when flag is enabled
  useEffect(() => {
    if (DEV_CARD_FLIP_DEBUG) {
      console.debug('[CardFlip]', 'CardStack', 'mounted')
    }
  }, [])

  const total = cardsData.length

  // Debug: log computed styles on first render
  useEffect(() => {
    if (DEV_CARD_FLIP_DEBUG) {
      console.log('[CardStack] Computed styles for', total, 'cards:')
      for (let depth = 0; depth < total; depth++) {
        const style = getStackStyle(depth, total)
        console.log(`  Depth ${depth}:`, style)
      }
    }
  }, [total])

  return (
    <div className={CARD_FLIP_CLASSES.stack}>
      {order.map((cardIdx, depth) => {
        const card = cardsData[cardIdx]
        const isTop = depth === 0
        const stackStyle = getStackStyle(depth, total)

        // During animation, adjust depth for smooth transitions
        const effectiveDepth = phase === 'animating' && depth > 0 ? depth - 1 : depth
        const effectiveStyle = phase === 'animating' && depth > 0 ? getStackStyle(effectiveDepth, total) : stackStyle

        if (DEV_CARD_FLIP_DEBUG && isTop) {
          console.debug('[CardFlip]', `CardStack-${cardIdx}`, 'top card rendered')
        }

        return (
          <CardStackCard
            key={cardIdx}
            card={card}
            index={cardIdx}
            position={depth}
            isTop={isTop}
            className={getCardClasses(cardIdx, depth)}
            onClick={() => handleCardClick(cardIdx)}
            onTouchStart={(e) => handleTouchStart(e, cardIdx)}
            onTouchEnd={(e) => handleTouchEnd(e, cardIdx)}
            style={{
              position: 'absolute',
              width: effectiveStyle.width,
              maxWidth: `${effectiveStyle.maxWidth}px`,
              height: `${effectiveStyle.height}px`,
              top: `${effectiveStyle.top}px`,
              left: `${effectiveStyle.left}px`,
              zIndex: effectiveStyle.zIndex,
              pointerEvents: isTop ? 'auto' : 'none',
              boxSizing: 'border-box',
              transition: 'width 300ms ease, height 300ms ease, top 300ms ease, left 300ms ease, box-shadow 300ms ease, opacity 300ms ease, transform 300ms ease',
            }}
            flashDirection={flashDirection[card.type]}
            onFlashEnd={() => {
              setFlashDirection((prev) => ({ ...prev, [card.type]: null }))
            }}
          />
        )
      })}
    </div>
  )
})

export default CardStack
