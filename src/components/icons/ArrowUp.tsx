import React from 'react'

interface ArrowUpProps {
  size?: number
  color?: string
}

export const ArrowUp: React.FC<ArrowUpProps> = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L5 11H9V20H15V11H19L12 4Z" fill={color} />
  </svg>
)

