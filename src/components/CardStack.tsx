'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import type { StaticImageData } from 'next/image'
import gobCardImage from '../../public/assets/cards/card-GOB3.jpg'
import CardAmounts from './CardAmounts'
import { CARD_FLIP_CLASSES } from '@/lib/animations/cardFlipClassNames'
import { DEV_CARD_FLIP_DEBUG } from '@/lib/flags'

// Temporary FX rate (will be wired to real API later)
const FX_USD_ZAR_DEFAULT = 18.1

function computeZAR(usdt: number, fx: number = FX_USD_ZAR_DEFAULT) {
  return usdt * fx
}

type CardType = 'pepe' | 'savings' | 'yield'

interface CardData {
  type: CardType
  image: string | StaticImageData
  alt: string
  width: number
  height: number
  usdt: number // canonical base in USDT
  fxUsdZar?: number // optional override
  yieldBadge?: {
    percentage: string
    text: string
  }
}

const cardsData: CardData[] = [
  {
    type: 'savings',
    image: '/assets/cards/card-savings.jpg',
    alt: 'Savings Card',
    width: 342,
    height: 213,
    usdt: 250, // demo value
  },
  {
    type: 'pepe',
    image: '/assets/cards/card-pepe.jpg',
    alt: 'PEPE Card',
    width: 398,
    height: 238,
    usdt: 100, // canonical value from original design
    yieldBadge: {
      percentage: '138%',
      text: 'APY',
    },
  },
  {
    type: 'yield',
    image: gobCardImage,
    alt: 'Yield Card',
    width: 310,
    height: 193,
    usdt: 100, // demo value (consistent with Pepe for now)
    yieldBadge: {
      percentage: '4.2%',
      text: 'APY',
    },
  },
]

interface CardStackProps {
  onTopCardChange?: (cardType: 'pepe' | 'savings' | 'yield') => void
}

export type CardStackHandle = {
  cycleNext: () => void
}

const CardStack = forwardRef<CardStackHandle, CardStackProps>(function CardStack({ onTopCardChange }, ref) {
  const [order, setOrder] = useState<number[]>([0, 1, 2]) // [top, middle, bottom]
  const [isAnimating, setIsAnimating] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'animating'>('idle')
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)

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

  const cycle = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setPhase('animating')

    // Phase A: Add cycling-out to top card and temporarily reassign position classes
    // This triggers the animation for middle/back cards to move up
    // The cycling-out class on top card makes it slide up and fade

    // After 300ms, finalize the rotation
    setTimeout(() => {
      // Phase B: Rotate order [a, b, c] → [b, c, a]
      setOrder((prevOrder) => [prevOrder[1], prevOrder[2], prevOrder[0]])
      setPhase('idle')
      setIsAnimating(false)
    }, 300)
  }

  // Expose cycleNext for external control (e.g., random flips)
  const cycleNext = () => {
    cycle()
  }

  useImperativeHandle(ref, () => ({
    cycleNext,
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
            <CardAmounts
              zar={computeZAR(card.usdt, card.fxUsdZar)}
              usdt={card.usdt}
              className={`card-amounts--${card.type}`}
            />
            {card.yieldBadge && (
              <div className={`card-yield-badge ${card.type === 'yield' ? 'card-yield-badge--gob' : ''}`}>
                <span className="card-yield-percentage">{card.yieldBadge.percentage}</span>
                <span className="card-yield-text">{card.yieldBadge.text}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
})

export default CardStack

