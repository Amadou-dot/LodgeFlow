'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { Share2 } from 'lucide-react';

interface CabinShareButtonProps {
  cabinName: string;
}

export default function CabinShareButton({ cabinName }: CabinShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: cabinName,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      startContent={<Share2 className='h-4 w-4' />}
      variant='flat'
      onPress={handleShare}
    >
      {copied ? 'Link Copied!' : 'Share'}
    </Button>
  );
}
