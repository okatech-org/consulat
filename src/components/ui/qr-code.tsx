import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  bgColor?: string;
}

export function QRCode({
  value,
  size = 128,
  level = 'M',
  bgColor = 'transparent',
}: QRCodeProps) {
  return (
    <div className="rounded-md">
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin
        className="size-full bg-transparent"
        bgColor={bgColor}
      />
    </div>
  );
}
