
"use client";

import { Card } from '@/components/ui/card';

export function QRCodeComponent({ url }: { url: string }) {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

  return (
    <Card className="bg-white p-4 inline-block">
      <img src={qrImageUrl} alt="QR Code" className="w-48 h-48 md:w-64 md:h-64" />
    </Card>
  );
}
