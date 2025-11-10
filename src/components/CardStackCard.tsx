'use client'

import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import { useRef, useEffect, useState } from 'react'
import SlotCounter from './SlotCounter'
import { formatZAR, formatUSDT } from '@/lib/formatCurrency'
import { useWalletAlloc } from '@/state/walletAlloc'
import { usePortfolioStore } from '@/store/portfolio'
import { useTweenNumber } from '@/lib/animations/useTweenNumber'
import { useTwoStageTween } from '@/lib/animations/useTwoStageTween'
import clsx from 'clsx'

const FX_USD_ZAR_DEFAULT = 18.1

type CardType = 'pepe' | 'savings' | 'yield'

type HealthLevel = 'good' | 'moderate' | 'fragile'

const HEALTH_CONFIG: Record<CardType, { level: HealthLevel; percent: number }> = {
  savings: { level: 'good', percent: 100 },
  pepe: { level: 'fragile', percent: 25 },
  yield: { level: 'moderate', percent: 60 },
}

const CARD_LABELS: Record<CardType, string> = {
  savings: 'CASH CARD',
  pepe: 'PEPE CARD',
  yield: 'ETH CARD',
}

const CARD_TO_ALLOC_KEY: Record<CardType, 'cashCents' | 'ethCents' | 'pepeCents'> = {
  savings: 'cashCents',
  pepe: 'pepeCents',
  yield: 'ethCents',
}

const CARD_TO_SYMBOL: Record<CardType, 'CASH' | 'ETH' | 'PEPE'> = {
  savings: 'CASH',
  pepe: 'PEPE',
  yield: 'ETH',
}

type CardStackCardProps = {
  card: {
    type: CardType
    image: string | StaticImageData
    alt: string
    width: number
    height: number
  }
  index: number
  position: number
  isTop: boolean
  className: string
  onClick: () => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  style: React.CSSProperties
  flashDirection: 'up' | 'down' | null
  onFlashEnd: () => void
}

export default function CardStackCard({
  card,
  index,
  position,
  isTop,
  className,
  onClick,
  onTouchStart,
  onTouchEnd,
  style,
  flashDirection,
  onFlashEnd,
}: CardStackCardProps) {
  const { alloc, allocPct } = useWalletAlloc()

  // Get allocation cents for this card
  const allocKey = CARD_TO_ALLOC_KEY[card.type]
  const cents = alloc[allocKey]
  const zar = cents / 100
  const usdt = zar / FX_USD_ZAR_DEFAULT
  const pct = allocPct(cents)

  // Get portfolio data for this card
  const symbol = CARD_TO_SYMBOL[card.type]
  const holding = usePortfolioStore((state) => state.getHolding(symbol))
  const portfolioAllocationPct = holding?.allocationPct ?? pct
  const portfolioHealth = holding?.health ?? HEALTH_CONFIG[card.type].percent

  // Animate allocation % with fade in/out
  const animatedAllocationPct = useTweenNumber(portfolioAllocationPct, {
    duration: 240,
    delay: 0,
    easing: 'easeOutCubic',
    round: (n) => Math.round(n),
  })

  // Check for reduced motion preference (client-side only)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  // Health animation with two-stage tween for minimum visual delta
  // Skip two-stage for reduced motion (just use direct value)
  const healthTweenResult = useTwoStageTween(portfolioHealth, {
    minVisualDelta: 1.0,
    previewCap: 3.0,
    stageADuration: 220,
    stageBDuration: 120,
    stageBDelay: 40,
    round: (n) => Math.round(n * 10) / 10,
  })
  const animatedHealth = prefersReducedMotion ? portfolioHealth : healthTweenResult.value
  const isHealthAnimating = prefersReducedMotion ? false : healthTweenResult.isAnimating

  // Visibility states for numeric readouts
  const [showHealthValue, setShowHealthValue] = useState(false)
  const [showAllocationValue, setShowAllocationValue] = useState(false)
  const prevHealthRef = useRef(portfolioHealth)
  const prevAllocationRef = useRef(portfolioAllocationPct)
  const healthVisibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const allocationVisibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const healthPulseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isHealthBarChanging, setIsHealthBarChanging] = useState(false)

  // Detect health changes and trigger visibility/pulse
  useEffect(() => {
    if (portfolioHealth !== prevHealthRef.current) {
      // Show health value
      setShowHealthValue(true)

      // Only add pulse if not reduced motion
      if (!prefersReducedMotion) {
        setIsHealthBarChanging(true)
      }

      // Clear existing timeouts
      if (healthVisibilityTimeoutRef.current) {
        clearTimeout(healthVisibilityTimeoutRef.current)
      }
      if (healthPulseTimeoutRef.current) {
        clearTimeout(healthPulseTimeoutRef.current)
      }

      // Hide health value after 1400ms (or shorter for reduced motion)
      const hideDelay = prefersReducedMotion ? 800 : 1400
      healthVisibilityTimeoutRef.current = setTimeout(() => {
        setShowHealthValue(false)
      }, hideDelay)

      // Remove pulse class after 200ms (only if not reduced motion)
      if (!prefersReducedMotion) {
        healthPulseTimeoutRef.current = setTimeout(() => {
          setIsHealthBarChanging(false)
        }, 200)
      }

      prevHealthRef.current = portfolioHealth
    }

    return () => {
      if (healthVisibilityTimeoutRef.current) {
        clearTimeout(healthVisibilityTimeoutRef.current)
      }
      if (healthPulseTimeoutRef.current) {
        clearTimeout(healthPulseTimeoutRef.current)
      }
    }
  }, [portfolioHealth, prefersReducedMotion])

  // Detect allocation changes and trigger visibility
  useEffect(() => {
    if (portfolioAllocationPct !== prevAllocationRef.current) {
      // Show allocation value
      setShowAllocationValue(true)

      // Clear existing timeout
      if (allocationVisibilityTimeoutRef.current) {
        clearTimeout(allocationVisibilityTimeoutRef.current)
      }

      // Hide allocation value after 1400ms
      allocationVisibilityTimeoutRef.current = setTimeout(() => {
        setShowAllocationValue(false)
      }, 1400)

      prevAllocationRef.current = portfolioAllocationPct
    }

    return () => {
      if (allocationVisibilityTimeoutRef.current) {
        clearTimeout(allocationVisibilityTimeoutRef.current)
      }
    }
  }, [portfolioAllocationPct])

  return (
    <div
      key={index}
      className={className}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={style}
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
        <Image src={card.image} alt={card.alt} width={card.width} height={card.height} unoptimized />
      )}

      {/* Amount display with SlotCounter */}
      <div className={`card-amounts card-amounts--${card.type}`}>
        <div
          className={clsx('card-amounts__zar amount-headline amount-topline', {
            'flash-up': flashDirection === 'up',
            'flash-down': flashDirection === 'down',
          })}
          aria-label={`${zar.toFixed(2)} rand`}
          onAnimationEnd={onFlashEnd}
        >
          <span className="amt-prefix card-amounts__symbol">R</span>
          <SlotCounter
            value={zar}
            format={formatZAR}
            durationMs={700}
            className="card-amounts__zar-value"
            onStart={() => {
              // Flash direction is already computed and set
            }}
            renderMajor={(major) => <span className="amt-int card-amounts__whole">{major}</span>}
            renderCents={(cents) => (
              <>
                <span className="amt-dot card-amounts__dot">.</span>
                <span className="amt-cents card-amounts__cents">{cents}</span>
              </>
            )}
          />
        </div>
        <div className="card-amounts__usdt" aria-label={`${usdt.toFixed(2)} USDT`}>
          <SlotCounter value={usdt} format={formatUSDT} durationMs={700} className="card-amounts__usdt-value" />
          <span style={{ marginLeft: '4px' }}>USDT</span>
        </div>
      </div>

      {/* Top-right card label */}
      <div className="card-label">{CARD_LABELS[card.type]}</div>

      {/* Bottom-left allocation pill */}
      <div className="card-allocation-pill">
        <span
          className={clsx('card-allocation-pill__text', {
            'card-allocation-pill__text--visible': showAllocationValue,
          })}
        >
          {animatedAllocationPct.toFixed(0)}%
        </span>
      </div>

      {/* Bottom-right health bar */}
      <div className="card-health-group">
        <span className="card-health-label">
          Health
          <span
            className={clsx('health-value', {
              'health-value--visible': showHealthValue,
            })}
          >
            {Math.round(animatedHealth)}%
          </span>
        </span>
        <div className="card-health-bar-container">
          <div
            className={clsx(
              `card-health-bar-fill card-health-bar-fill--${HEALTH_CONFIG[card.type].level}`,
              {
                'card-health-bar-fill--changing': isHealthBarChanging,
              }
            )}
            style={{ width: `${Math.max(0, Math.min(100, animatedHealth))}%` }}
          />
        </div>
      </div>
    </div>
  )
}

