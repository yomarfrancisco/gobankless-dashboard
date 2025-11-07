'use client'

import Image from 'next/image'

export default function TopGlassBar() {
  return (
    <div className="page-title-gobankless">
      <Image
        src="/assets/core/glass-top-1.png"
        alt=""
        className="glass-shard-small"
        width={729}
        height={713}
        priority
        unoptimized
      />
      {/* NOTE: spraypaint layer kept commented until asset exists */}
      {/*
      <Image
        src="/assets/core/spraypaint-2.png"
        alt=""
        className="spraypaint-effect"
        width={300}
        height={120}
        priority
        unoptimized
      />
      */}
      <Image
        src="/assets/core/gobankless-logo.png"
        alt="GoBankless"
        className="gobankless-logo"
        width={220}
        height={65}
        priority
        unoptimized
      />
      <div className="icons">
        <div className="icon-group">
          <Image src="/assets/core/scan.svg" alt="Scan" className="icon" width={24} height={24} />
          <Image src="/assets/core/export.svg" alt="Share" className="icon" width={24} height={24} />
        </div>
      </div>
    </div>
  )
}

