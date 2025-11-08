import { useEffect, useRef } from 'react'

type Opts = {
  quietMs: number
  minMs: number
  maxMs: number
  minFlips: number
  maxFlips: number
  enabled: boolean
  flip: () => void // calls controller.cycleNext()
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function useRandomCardFlips(opts: Opts) {
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (!opts.enabled) return

    const clearAll = () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }

    const scheduleBurst = () => {
      const delay = randInt(opts.minMs, opts.maxMs)

      const t = window.setTimeout(() => {
        // number of flips in this burst
        const flips = randInt(opts.minFlips, opts.maxFlips)

        for (let i = 0; i < flips; i++) {
          const tt = window.setTimeout(() => {
            // only flip if visible
            if (document.visibilityState === 'visible') {
              opts.flip()
            }
          }, i * 350) // space > transition (300ms)

          timers.current.push(tt)
        }

        // schedule next burst
        scheduleBurst()
      }, delay)

      timers.current.push(t)
    }

    // initial quiet period
    const start = () => {
      const t0 = window.setTimeout(() => {
        if (document.visibilityState === 'visible') {
          scheduleBurst()
        } else {
          // wait until visible, then start
          const onVisible = () => {
            if (document.visibilityState === 'visible') {
              document.removeEventListener('visibilitychange', onVisible)
              scheduleBurst()
            }
          }

          document.addEventListener('visibilitychange', onVisible)
        }
      }, opts.quietMs)

      timers.current.push(t0)
    }

    start()

    // pause/resume behavior:
    const onHide = () => {
      if (document.visibilityState !== 'visible') {
        clearAll() // stop timers while hidden
      }
    }

    const onShow = () => {
      if (document.visibilityState === 'visible') {
        scheduleBurst() // resume with a fresh schedule
      }
    }

    document.addEventListener('visibilitychange', onHide)
    document.addEventListener('visibilitychange', onShow)

    return () => {
      clearAll()
      document.removeEventListener('visibilitychange', onHide)
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [opts.enabled, opts.quietMs, opts.minMs, opts.maxMs, opts.minFlips, opts.maxFlips, opts.flip])
}

