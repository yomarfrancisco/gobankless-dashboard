import React from 'react'

interface ArrowDownProps {
  size?: number
  color?: string
}

export const ArrowDown: React.FC<ArrowDownProps> = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20L19 13H15V4H9V13H5L12 20Z" fill={color} />
  </svg>
)

