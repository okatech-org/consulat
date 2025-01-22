import { QRCodeSVG } from 'qrcode.react'

interface QRCodeProps {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
}

export function QRCode({ value, size = 128, level = 'M' }: QRCodeProps) {
  return (
    <div className="rounded-md bg-white">
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin
        className="size-full"
      />
    </div>
  )
}