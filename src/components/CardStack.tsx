'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import type React from 'react'
import type { StaticImageData } from 'next/image'
import gobCardImage from '../../public/assets/cards/card-GOB3.jpg'
import NumberRoll from './NumberRoll'
import { CARD_FLIP_CLASSES } from '@/lib/animations/cardFlipClassNames'
import { DEV_CARD_FLIP_DEBUG } from '@/lib/flags'
import { useWalletAlloc } from '@/state/walletAlloc'
import { useAiRebalance, type AiAction } from '@/lib/aiActions/useAiRebalance'
import { useRandomCardFlips } from '@/lib/animations/useRandomCardFlips'

// Temporary FX rate (will be wired to real API later)
const FX_USD_ZAR_DEFAULT = 18.1

function computeZAR(usdt: number, fx: number = FX_USD_ZAR_DEFAULT) {
  return usdt * fx
}

// Health levels: 'good' | 'moderate' | 'fragile'
type HealthLevel = 'good' | 'moderate' | 'fragile'

// Health configuration per card type
const HEALTH_CONFIG: Record<CardType, { level: HealthLevel; percent: number }> = {
  savings: { level: 'good', percent: 100 },
  pepe: { level: 'fragile', percent: 25 },
  yield: { level: 'moderate', percent: 60 },
}

type CardType = 'pepe' | 'savings' | 'yield'

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
]

// Card labels mapping
const CARD_LABELS: Record<CardType, string> = {
  savings: 'CASH CARD',
  pepe: 'PEPE CARD',
  yield: 'ETH CARD',
}

// Map card type to allocation key
const CARD_TO_ALLOC_KEY: Record<CardType, 'cashCents' | 'ethCents' | 'pepeCents'> = {
  savings: 'cashCents',
  pepe: 'pepeCents',
  yield: 'ethCents',
}

// Map allocation key to card type
const ALLOC_KEY_TO_CARD: Record<'cash' | 'eth' | 'pepe', CardType> = {
  cash: 'savings',
  eth: 'yield',
  pepe: 'pepe',
}

interface CardStackProps {
  onTopCardChange?: (cardType: 'pepe' | 'savings' | 'yield') => void
  flipControllerRef?: React.MutableRefObject<{ pause: () => void; resume: () => void } | null>
}

export type CardStackHandle = {
  cycleNext: () => void
  flipToCard: (cardType: CardType) => Promise<void>
}

const FLIP_DURATION_MS = 300
const FLIP_BUFFER_MS = 50
const NUMBER_ROLL_DURATION_MS = 400
const COOLDOWN_MIN_MS = 6000
const COOLDOWN_MAX_MS = 9000

const CardStack = forwardRef<CardStackHandle, CardStackProps>(function CardStack({ onTopCardChange, flipControllerRef: externalFlipControllerRef }, ref) {
  const [order, setOrder] = useState<number[]>([0, 1, 2]) // [top, middle, bottom]
  const [isAnimating, setIsAnimating] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'animating'>('idle')
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)
  const actionQueueRef = useRef<AiAction[]>([])
  const isProcessingActionRef = useRef(false)

  const { alloc, isRebalancing, setRebalancing, applyAiAction, allocPct } = useWalletAlloc()
  const aiRebalance = useAiRebalance(alloc)

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

  // Get card type by index
  const getCardType = useCallback((index: number): CardType => {
    return cardsData[index].type
  }, [])

  // Flip to a specific card type
  const flipToCard = useCallback(
    async (targetCardType: CardType): Promise<void> => {
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
      // We need to cycle until target is at position 0
      let cyclesNeeded = targetPosition

      return new Promise((resolve) => {
        const performCycle = (remaining: number) => {
          if (remaining === 0) {
            resolve()
            return
          }

          if (isAnimating) {
            // Wait for current animation to finish
            setTimeout(() => performCycle(remaining), FLIP_DURATION_MS + FLIP_BUFFER_MS)
            return
          }

          setIsAnimating(true)
          setPhase('animating')

          setTimeout(() => {
            setOrder((prevOrder) => [prevOrder[1], prevOrder[2], prevOrder[0]])
            setPhase('idle')
            setIsAnimating(false)

            // Continue with next cycle if needed
            if (remaining > 1) {
              setTimeout(() => performCycle(remaining - 1), FLIP_BUFFER_MS)
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

  // Use external flip controller ref if provided, otherwise create internal one
  const internalFlipControllerRef = useRef<{ pause: () => void; resume: () => void } | null>(null)
  const flipControllerRef = externalFlipControllerRef || internalFlipControllerRef
  
  // Set up random card flips with controller
  useRandomCardFlips(ref as React.RefObject<CardStackHandle | null>, flipControllerRef)

  // Process AI action sequence
  const processAiAction = useCallback(
    async (action: AiAction) => {
      if (isProcessingActionRef.current) {
        // Queue action
        actionQueueRef.current.push(action)
        return
      }

      isProcessingActionRef.current = true
      setRebalancing(true)
      
      // Pause ambient flips
      if (flipControllerRef.current) {
        flipControllerRef.current.pause()
      }

      try {
        const targetCardType = ALLOC_KEY_TO_CARD[action.to]
        const sourceCardType = ALLOC_KEY_TO_CARD[action.from]

        // 1. Flip to target card
        await flipToCard(targetCardType)

        // 2. Wait for flip to complete
        await new Promise((resolve) => setTimeout(resolve, FLIP_BUFFER_MS))

        // 3. Get old and new values for target
        const allocKey = CARD_TO_ALLOC_KEY[targetCardType]
        const oldTargetCents = alloc[allocKey]
        const newTargetCents = oldTargetCents + action.cents

        // 4. Apply action to state (this triggers NumberRoll animation)
        applyAiAction(action)

        // 5. Wait for number roll animation
        await new Promise((resolve) => setTimeout(resolve, NUMBER_ROLL_DURATION_MS))

        // 6. Flip back to Cash (savings)
        await flipToCard('savings')

        // 7. Wait for flip to complete
        await new Promise((resolve) => setTimeout(resolve, FLIP_BUFFER_MS))

        // 8. Cash value already updated by applyAiAction, NumberRoll will animate
        // Wait for number roll animation
        await new Promise((resolve) => setTimeout(resolve, NUMBER_ROLL_DURATION_MS))

        // 9. Cooldown before resuming ambient flips
        const cooldown = COOLDOWN_MIN_MS + Math.random() * (COOLDOWN_MAX_MS - COOLDOWN_MIN_MS)
        await new Promise((resolve) => setTimeout(resolve, cooldown))
      } finally {
        setRebalancing(false)
        isProcessingActionRef.current = false

        // Resume ambient flips
        if (flipControllerRef.current) {
          flipControllerRef.current.resume()
        }

        // Process next queued action if any
        const nextAction = actionQueueRef.current.shift()
        if (nextAction) {
          setTimeout(() => processAiAction(nextAction), 100)
        }
      }
    },
    [alloc, flipToCard, applyAiAction, setRebalancing]
  )

  // Subscribe to AI actions
  useEffect(() => {
    const unsubscribe = aiRebalance.onAction((action) => {
      processAiAction(action)
    })

    // Start AI rebalance generator
    aiRebalance.start()

    return () => {
      unsubscribe()
      aiRebalance.stop()
    }
  }, [aiRebalance, processAiAction])

  const cycle = () => {
    if (isAnimating || isRebalancing) return

    setIsAnimating(true)
    setPhase('animating')

    setTimeout(() => {
      setOrder((prevOrder) => [prevOrder[1], prevOrder[2], prevOrder[0]])
      setPhase('idle')
      setIsAnimating(false)
    }, FLIP_DURATION_MS)
  }

  // Expose cycleNext for external control (e.g., random flips)
  const cycleNext = () => {
    cycle()
  }

  useImperativeHandle(ref, () => ({
    cycleNext,
    flipToCard,
  }))

  const handleCardClick = (index: number) => {
    // Only respond if this card is the top card (order[0])
    if (order[0] === index && !isAnimating && !isRebalancing) {
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
      if (swipeDistance > minSwipeDistance && !isAnimating && !isRebalancing) {
        cycle()
      }
    }
  }

  const getCardClasses = (index: number) => {
    const currentOrder = order
    const position = currentOrder.indexOf(index)
    const isTop = position === 0
    const isCyclingOut = isTop && phase === 'animating'

    let positionClass = ''
    if (phase === 'animating') {
      // During animation, temporarily reassign classes so middle/back animate smoothly
      if (position === 0) {
        // Top card: keep pos-top but add cycling-out
        positionClass = CARD_FLIP_CLASSES.posTop
      } else if (position === 1) {
        // Middle card: temporarily becomes pos-top (will animate to top position)
        positionClass = CARD_FLIP_CLASSES.posTop
      } else if (position === 2) {
        // Back card: temporarily becomes pos-mid (will animate to middle position)
        positionClass = CARD_FLIP_CLASSES.posMid
      }
    } else {
      // Normal state: map position to class
      if (position === 0) {
        positionClass = CARD_FLIP_CLASSES.posTop
      } else if (position === 1) {
        positionClass = CARD_FLIP_CLASSES.posMid
      } else {
        positionClass = CARD_FLIP_CLASSES.posBack
      }
    }

    return `${CARD_FLIP_CLASSES.card} ${positionClass} ${isCyclingOut ? CARD_FLIP_CLASSES.cyclingOut : ''} ${!isTop ? CARD_FLIP_CLASSES.noHover : ''}`
  }

  // Debug logging when flag is enabled
  useEffect(() => {
    if (DEV_CARD_FLIP_DEBUG) {
      console.debug('[CardFlip]', 'CardStack', 'mounted')
    }
  }, [])

  return (
    <div className={CARD_FLIP_CLASSES.stack}>
      {cardsData.map((card, index) => {
        const position = order.indexOf(index)
        const isTop = position === 0

        if (DEV_CARD_FLIP_DEBUG && isTop) {
          console.debug('[CardFlip]', `CardStack-${index}`, 'top card rendered')
        }

        // Get allocation cents for this card
        const allocKey = CARD_TO_ALLOC_KEY[card.type]
        const cents = alloc[allocKey]
        const zar = cents / 100
        const usdt = zar / FX_USD_ZAR_DEFAULT
        const pct = allocPct(cents)

        return (
          <div
            key={index}
            className={getCardClasses(index)}
            onClick={() => handleCardClick(index)}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchEnd={(e) => handleTouchEnd(e, index)}
            style={{
              zIndex: isTop ? 3 : position === 1 ? 2 : 1, // Ensure z-index is correct
            }}
          >
            {card.type === 'yield' ? (
              <div className="card-canvas card-yield-rounded">
                <Image
                  src={card.image}
                  alt="GoB yield card"
                  fill
                  sizes="(max-width: 768px) 88vw, 420px"
                  priority
                  style={{ objectFit: 'cover', borderRadius: 'inherit' }}
                />
              </div>
            ) : (
              <Image
                src={card.image}
                alt={card.alt}
                width={card.width}
                height={card.height}
                unoptimized
              />
            )}

            {/* Amount display with NumberRoll */}
            <div className={`card-amounts card-amounts--${card.type}`}>
              <div className="card-amounts__zar" aria-label={`${zar.toFixed(2)} rand`}>
                <NumberRoll valueCents={cents} currency="ZAR" durationMs={NUMBER_ROLL_DURATION_MS} />
              </div>
              <div className="card-amounts__usdt" aria-label={`${usdt.toFixed(2)} USDT`}>
                <NumberRoll valueCents={Math.round(usdt * 100)} currency="USD" durationMs={NUMBER_ROLL_DURATION_MS} />
                <span style={{ marginLeft: '4px' }}>USDT</span>
              </div>
            </div>

            {/* Top-right card label */}
            <div className="card-label">{CARD_LABELS[card.type]}</div>

            {/* Bottom-left allocation pill */}
            <div className="card-allocation-pill">
              <span className="card-allocation-pill__text">{pct.toFixed(0)}%</span>
            </div>

            {/* Bottom-right health bar */}
            <div className="card-health-group">
              <span className="card-health-label">Health</span>
              <div className="card-health-bar-container">
                <div
                  className={`card-health-bar-fill card-health-bar-fill--${HEALTH_CONFIG[card.type].level}`}
                  style={{ width: `${HEALTH_CONFIG[card.type].percent}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
})

export default CardStack
