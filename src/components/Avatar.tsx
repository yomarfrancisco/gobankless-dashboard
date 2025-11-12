'use client'

import Image from 'next/image'
import { memo, useMemo } from 'react'
import clsx from 'clsx'

type Props = {
  name?: string
  email?: string
  size?: number
  rounded?: number
  className?: string
}

function getInitial(name?: string, email?: string): string {
  const fromName = (name ?? '').trim()
  if (fromName) return fromName[0]!.toUpperCase()

  const local = (email ?? '').split('@')[0] ?? ''
  if (local) return local[0]!.toUpperCase()

  return 'S' // fallback
}

const Avatar = ({ name, email, size = 72, rounded = 24, className }: Props) => {
  const initial = useMemo(() => getInitial(name, email), [name, email])
  const fontSize = Math.round(size * 0.42)

  return (
    <div
      className={clsx('relative overflow-hidden', className)}
      style={{ width: size, height: size, borderRadius: rounded }}
      aria-label={`Avatar ${name || email || ''}`}
    >
      <Image
        src="/assets/avatar-profile.png"
        alt=""
        fill
        sizes={`${size}px`}
        priority={false}
        style={{ objectFit: 'cover', objectPosition: 'top' }}
      />
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -52%)',
          fontWeight: 300,
          fontSize,
          letterSpacing: '-0.23px',
          color: '#f5f5f5',
          textShadow: '0 1px 2px rgba(0,0,0,0.35)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {initial}
      </span>
    </div>
  )
}

export default memo(Avatar)

