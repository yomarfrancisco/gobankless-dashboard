'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import ActionSheet from '../ActionSheet'
import styles from './SendToWalletSheet.module.css'
import Image from 'next/image'

type SendToWalletSheetProps = {
  open: boolean
  amountZAR: number
  onClose: () => void
  onConfirm: (address: string) => void
}

export default function SendToWalletSheet({
  open,
  amountZAR,
  onClose,
  onConfirm,
}: SendToWalletSheetProps) {
  const [addr, setAddr] = useState('')
  const [valid, setValid] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setAddr('')
      setValid(false)
      return
    }
  }, [open])

  useEffect(() => {
    setValid(addr.trim().length > 0)
  }, [addr])

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setAddr(text.trim())
    } catch {
      // No-op for now
      console.warn('Clipboard access denied')
    }
  }

  const handleSubmit = () => {
    if (!valid) return
    onConfirm(addr.trim())
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="" className={styles.sheet}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>USDT Wallet address</h3>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <p className={styles.subtitle}>Send USDT to this address</p>

        <div className={styles.card}>
          <div className={styles.fieldLabel}>Address</div>
          <div className={styles.fieldWrap}>
            <input
              ref={inputRef}
              className={styles.fieldInput}
              placeholder="USDT wallet address"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
            />
            <button className={styles.pasteBtn} onClick={handlePaste}>
              Paste
            </button>
          </div>
          <div className={styles.infoRow}>
            <Image
              src="/assets/error.svg"
              alt=""
              width={16}
              height={16}
              className={styles.infoIcon}
              aria-hidden="true"
            />
            <span className={styles.infoText}>
              Make sure you send to a correct and valid address only. Crypto sends can&apos;t be
              reversed.
            </span>
          </div>
        </div>

        <button
          className={styles.cta}
          disabled={!valid}
          onClick={handleSubmit}
          type="button"
        >
          Send to wallet
        </button>

        <div className={styles.instructions}>
          <h4 className={styles.instructionsTitle}>How to send USDT</h4>

          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <p className={styles.stepText}>Open your crypto wallet</p>
              <div className={styles.walletLogos}>
                <Image
                  src="/assets/19e958d6fc32109627aa7b81d4ae1f814e1631b1.png"
                  alt="MetaMask"
                  width={48}
                  height={48}
                  className={styles.walletLogo}
                />
                <Image
                  src="/assets/94c8d4e6853f1fbe2e422289fb18e9091eec75c5.png"
                  alt="Coinbase Wallet"
                  width={48}
                  height={48}
                  className={styles.walletLogo}
                />
                <Image
                  src="/assets/a720ce3503a23fe4350d400b665d6d0915ed6fee.png"
                  alt="Okto"
                  width={48}
                  height={48}
                  className={styles.walletLogo}
                />
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <p className={styles.stepText}>Choose to Receive crypto</p>
              <div className={styles.placeholderImage}>
                <Image
                  src="/assets/e353623d77d797e283c0d1a9d6e747dae2ed46f0.png"
                  alt=""
                  width={280}
                  height={160}
                  className={styles.instructionImage}
                />
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <p className={styles.stepText}>Copy the address</p>
              <div className={styles.placeholderImage}>
                <Image
                  src="/assets/e353623d77d797e283c0d1a9d6e747dae2ed46f0.png"
                  alt=""
                  width={280}
                  height={160}
                  className={styles.instructionImage}
                />
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <p className={styles.stepText}>Paste address in GoBankless</p>
              <div className={styles.miniInputMock}>
                <div className={styles.miniInput}>0x1234...5678</div>
                <button className={styles.miniPasteBtn}>Paste</button>
              </div>
              <div className={styles.miniCtaMock}>
                <button className={styles.miniSendBtn}>Send to wallet</button>
              </div>
            </div>
          </div>

          <div className={styles.tipPanel}>
            <Image
              src="/assets/dollar.svg"
              alt=""
              width={20}
              height={20}
              className={styles.tipIcon}
              aria-hidden="true"
            />
            <p className={styles.tipText}>
              We recommend sending a test amount first to verify the address is correct.
            </p>
          </div>
        </div>
      </div>
    </ActionSheet>
  )
}

