'use client'

import QRCode from 'qrcode'

/**
 * Generate QR code as data URL (PNG)
 */
export async function generateQRCodeDataURL(text: string, size: number = 220): Promise<string> {
  try {
    const dataURL = await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return dataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

/**
 * Generate QR code as canvas element
 */
export async function generateQRCodeCanvas(text: string, size: number = 220): Promise<HTMLCanvasElement> {
  try {
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return canvas
  } catch (error) {
    console.error('Error generating QR code canvas:', error)
    throw error
  }
}

/**
 * Generate QR code with embedded logo
 */
export async function generateQRCodeWithLogo(
  text: string,
  logoUrl: string,
  qrSize: number = 220,
  logoSize: number = 52
): Promise<string> {
  try {
    // Generate base QR code
    const canvas = await generateQRCodeCanvas(text, qrSize)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    // Load and draw logo
    const logo = new window.Image()
    await new Promise((resolve, reject) => {
      logo.onload = resolve
      logo.onerror = reject
      logo.src = logoUrl
    })

    // Calculate logo position (center)
    const logoX = (qrSize - logoSize) / 2
    const logoY = (qrSize - logoSize) / 2

    // Draw white circular background for logo
    const logoBgSize = 64
    const logoBgX = (qrSize - logoBgSize) / 2
    const logoBgY = (qrSize - logoBgSize) / 2

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(qrSize / 2, qrSize / 2, logoBgSize / 2, 0, 2 * Math.PI)
    ctx.fill()

    // Draw logo
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)

    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error generating QR code with logo:', error)
    throw error
  }
}

/**
 * Download QR code as PNG
 */
export function downloadQRCode(dataURL: string, filename: string = 'qr-code.png'): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

