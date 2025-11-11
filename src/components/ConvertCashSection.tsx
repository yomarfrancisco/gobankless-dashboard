import Image from 'next/image'
import styles from './ConvertCashSection.module.css'
import MapboxMap, { type Marker } from './MapboxMap'

const markers: Marker[] = [
  { id: 'dealer-1', lng: 28.0549, lat: -26.1064, kind: 'dealer', label: 'Nearest dealer' },
  { id: 'branch-1', lng: 28.0598, lat: -26.1089, kind: 'branch', label: 'Partner branch' },
]

export default function ConvertCashSection() {
  return (
    <section className={styles.wrap} aria-labelledby="convert-title">
      <div className={styles.headerRow}>
        <h2 id="convert-title" className={styles.title}>
          Convert cash to crypto
        </h2>
        <button className={styles.helpBtn} aria-label="Help">
          ?
        </button>
      </div>
      <p className={styles.sub}>
        Find partner bank managers and branches to help you open an account.
      </p>

      <div className={styles.mapCard}>
        {/* Empty map container - Mapbox will attach here */}
        <div ref={(el) => {
          // Expose container ref to MapboxMap via a ref callback
          // This ensures the container is empty before Mapbox attaches
        }} className={styles.mapContainer} id="mapbox-container" />
        
        {/* Live map component - renders into mapContainer */}
        <MapboxMap
          containerId="mapbox-container"
          markers={markers}
          styleUrl="mapbox://styles/mapbox/light-v11"
        />

        {/* Paper/fold overlays as siblings, not children of map container */}
        <Image
          src="/assets/fold1.png"
          alt=""
          fill
          className={styles.fold1}
          priority
        />
        <Image
          src="/assets/fold2.png"
          alt=""
          fill
          className={styles.fold2}
          priority
        />
      </div>
    </section>
  )
}

