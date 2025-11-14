import React from 'react'

interface TriangleDownProps {
  size?: number
  color?: string
}

export const TriangleDown: React.FC<TriangleDownProps> = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="4,4 20,4 12,20" fill={color} />
  </svg>
)

