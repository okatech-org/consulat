import { QRCodeSVG } from 'qrcode.react'

interface QRCodeProps {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
}

export function QRCode({ value, size = 128, level = 'M' }: QRCodeProps) {
  return (
    <div className="bg-white rounded-md">
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin
        className="h-full w-full"
      />
    </div>
  )
}