import { useEffect } from 'react'
import type React from 'react'
import type { CardStackHandle } from '@/components/CardStack'

const ENABLED = process.env.NEXT_PUBLIC_ENABLE_RANDOM_CARD_FLIPS === '1'
const QUIET_MS = Number(process.env.NEXT_PUBLIC_RANDOM_FLIP_QUIET_MS ?? 10000)
const MIN_MS = Number(process.env.NEXT_PUBLIC_RANDOM_FLIP_MIN_MS ?? 1000)
const MAX_MS = Number(process.env.NEXT_PUBLIC_RANDOM_FLIP_MAX_MS ?? 60000)
const MIN_COUNT = Number(process.env.NEXT_PUBLIC_RANDOM_FLIP_MIN_COUNT ?? 1)
const MAX_COUNT = Number(process.env.NEXT_PUBLIC_RANDOM_FLIP_MAX_COUNT ?? 3)
// Per-flip delay inside a burst (>= CSS animation ~300ms)
const BURST_STEP_MS = Number(process.env.NEXT_PUBLIC_RANDOM_FLIP_BURST_STEP_MS ?? 350)

export function useRandomCardFlips(ref: React.RefObject<CardStackHandle | null>) {
  useEffect(() => {
    if (!ENABLED || !ref?.current) return

    let aborted = false
    let bursting = false

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

    const handleVisibility = () => {
      // pause/resume by toggling the aborted flag softly
      if (document.hidden) {
        aborted = true
      } else {
        aborted = false
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    const run = async () => {
      // initial quiet period
      await sleep(QUIET_MS)

      while (ref.current) {
        // if hidden, idle-loop until visible again
        while (document.hidden) {
          await sleep(250)
        }

        // wait a random interval between bursts
        const wait = rnd(MIN_MS, MAX_MS)
        await sleep(wait)

        if (!ref.current) break

        if (bursting) continue // never overlap bursts

        bursting = true

        const flips = rnd(MIN_COUNT, MAX_COUNT)

        for (let i = 0; i < flips; i++) {
          // safety: ensure ref still valid and page visible
          if (!ref.current || document.hidden) break

          ref.current.cycleNext()

          await sleep(BURST_STEP_MS) // allow CSS transition to finish
        }

        bursting = false
      }
    }

    run()

    return () => {
      aborted = true
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [ref])
}

