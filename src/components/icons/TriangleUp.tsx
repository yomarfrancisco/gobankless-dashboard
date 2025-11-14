import React from 'react'

interface TriangleUpProps {
  size?: number
  color?: string
}

export const TriangleUp: React.FC<TriangleUpProps> = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,4 20,20 4,20" fill={color} />
  </svg>
)

