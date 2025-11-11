import Image from 'next/image'
import styles from './ConvertCashSection.module.css'

export default function ConvertCashSection() {
  return (
    <section className={styles.wrap} aria-labelledby="convert-cash-title">
      <header className={styles.header}>
        <h2 id="convert-cash-title" className={styles.title}>
          Convert cash to crypto
        </h2>
        <button
          type="button"
          className={styles.help}
          aria-label="About converting cash to crypto"
        >
          ?
        </button>
      </header>
      <p className={styles.subcopy}>
        Find partner bank managers and branches to help you open an account.
      </p>

      {/* Map card (static first; keep structure ready for live map swap) */}
      <div className={styles.mapCard}>
        {/* Map image as the base layer */}
        <Image
          src="/assets/map.png"
          alt="Sandton area map"
          className={styles.mapImg}
          fill
          priority={false}
          sizes="(max-width: 768px) 92vw, 720px"
        />

        {/* Fold overlays (paper texture/crease) */}
        <Image
          src="/assets/fold1.png"
          alt=""
          aria-hidden="true"
          className={styles.foldOne}
          fill
          sizes="(max-width: 768px) 92vw, 720px"
        />
        <Image
          src="/assets/fold2.png"
          alt=""
          aria-hidden="true"
          className={styles.foldTwo}
          fill
          sizes="(max-width: 768px) 92vw, 720px"
        />

        {/* Optional "You are here" chip — keep in DOM, hidden by default */}
        <div className={styles.here} hidden>
          <span>You are here</span>
        </div>

        {/* Markers layer – leave empty for now; we'll populate later */}
        <div className={styles.markers} aria-hidden="true" />
      </div>
    </section>
  )
}

