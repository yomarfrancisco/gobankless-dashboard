'use client'

import Image from 'next/image'
import '@/styles/action-sheet.css'

type Props = {
  iconSrc: string
  title: string
  caption?: string
  onClick?: () => void
}

export default function ActionSheetItem({ iconSrc, title, caption, onClick }: Props) {
  return (
    <button className="asi" onClick={onClick}>
      <div className="asi-left">
        <div className="asi-icon">
          <Image src={iconSrc} alt="" width={24} height={24} />
        </div>
        <div className="asi-texts">
          <div className="asi-title">{title}</div>
          {caption && <div className="asi-caption">{caption}</div>}
        </div>
      </div>
      <Image src="/assets/next_ui.svg" alt="" width={24} height={24} />
    </button>
  )
}

