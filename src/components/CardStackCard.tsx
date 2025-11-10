'use client'

import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import { useRef, useEffect } from 'react'
import SlotCounter from './SlotCounter'
import { formatZAR, formatUSDT } from '@/lib/formatCurrency'
import { useWalletAlloc } from '@/state/walletAlloc'
import { usePortfolioStore } from '@/store/portfolio'
import { useTweenNumber } from '@/lib/animations/useTweenNumber'
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

  // Animate allocation % and health
  const animatedAllocationPct = useTweenNumber(portfolioAllocationPct, {
    duration: 240,
    delay: 0,
    easing: 'easeOutCubic',
    round: (n) => Math.round(n),
  })

  // Health animation with minimum delta visibility
  const prevHealthRef = useRef(portfolioHealth)
  const healthDelta = Math.abs(portfolioHealth - prevHealthRef.current)
  const minHealthDelta = 0.4
  const adjustedHealth =
    healthDelta < minHealthDelta && healthDelta > 0
      ? portfolioHealth > prevHealthRef.current
        ? prevHealthRef.current + minHealthDelta
        : prevHealthRef.current - minHealthDelta
      : portfolioHealth

  const animatedHealth = useTweenNumber(adjustedHealth, {
    duration: 260,
    delay: 0,
    easing: 'easeOutCubic',
    round: (n) => Math.round(n * 10) / 10,
  })

  // Update prev health after animation
  useEffect(() => {
    if (Math.abs(animatedHealth - portfolioHealth) < 0.1) {
      prevHealthRef.current = portfolioHealth
    }
  }, [animatedHealth, portfolioHealth])

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
        <span className="card-allocation-pill__text">{animatedAllocationPct.toFixed(0)}%</span>
      </div>

      {/* Bottom-right health bar */}
      <div className="card-health-group">
        <span className="card-health-label">Health</span>
        <div className="card-health-bar-container">
          <div
            className={`card-health-bar-fill card-health-bar-fill--${HEALTH_CONFIG[card.type].level}`}
            style={{ width: `${Math.max(0, Math.min(100, animatedHealth))}%` }}
          />
        </div>
      </div>
    </div>
  )
}

