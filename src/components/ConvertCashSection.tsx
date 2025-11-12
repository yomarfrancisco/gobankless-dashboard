import Image from 'next/image'
import styles from './ConvertCashSection.module.css'
import MapboxMap, { type Marker } from './MapboxMap'

const sandtonBranch: Marker = {
  id: 'branch-sandton-city',
  lng: 28.054167,
  lat: -26.108333,
  kind: 'branch',
  label: 'Sandton City Branch',
}

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
        Deposit cash and receive stablecoins directly from verified agents and partner branches.
      </p>

      <div className={styles.mapCard}>
        {/* Empty map container - Mapbox will attach here */}
        <div className={styles.mapContainer} id="mapbox-container" />
        
        {/* Live map component - renders into mapContainer */}
        <MapboxMap
          containerId="mapbox-container"
          markers={[sandtonBranch]}
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

