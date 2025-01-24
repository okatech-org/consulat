'use client';

import Image from 'next/image';
import * as React from 'react';
import Link from 'next/link';
import { Route } from 'next';
import MissingBadge from '@/components/ui/missing-badge';

type FilePreviewProps = Readonly<{
  url?: string;
  label: string;
  customClasses?: string;
  isMissing?: boolean;
}>;

export default function FilePreview({
  url,
  label,
  customClasses,
  isMissing = false,
}: FilePreviewProps) {
  const isPdf = url?.endsWith('.pdf');

  return (
    <div
      className={`passsport-doc flex flex-col gap-4 rounded border border-muted px-4 py-3 ${customClasses}`}
    >
      <div className="flex aspect-[320/400] items-center justify-center">
        {url && (
          <>
            {isPdf ? (
              <div className="file-viewer relative size-full">
                <iframe
                  title={'PDF ' + label}
                  src={`${url}`}
                  style={{ aspectRatio: '300/400' }}
                  width="100%"
                  height="100%"
                ></iframe>
                <Link
                  href={url as Route}
                  target={'_blank'}
                  className={'absolute left-0 top-0 size-full'}
                />
              </div>
            ) : (
              <Link href={url as Route} target={'_blank'} className={'size-full'}>
                <Image src={url} alt={label} width={300} height={300} />
              </Link>
            )}
          </>
        )}

        {isMissing && <MissingBadge isMissing={true} />}
      </div>
      <p className={'truncate text-sm'}>{label}</p>
    </div>
  );
}
