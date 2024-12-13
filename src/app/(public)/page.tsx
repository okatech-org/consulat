import * as React from 'react'
import Link from 'next/link'
import { ROUTES } from '@/schemas/routes'
import { buttonVariants } from '@/components/ui/button'
import imagePicture from '@/assets/contact-ga-image.png'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('home')

  return (
    <div
      className="container relative flex grow flex-col-reverse justify-evenly gap-4 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
      <div className='relative max-w-[70%] space-y-4 md:max-w-full'>
        <h2 className={'text-lg font-semibold uppercase lg:text-6xl'}>
          {t('title')}
        </h2>
        <p>{t('subtitle')}</p>
        <div className='actions flex flex-wrap items-center gap-4'>
          <Link
            href={ROUTES.registration}
            className={
              buttonVariants({
                variant: 'default',
              }) +
              ' !rounded-full !text-lg !p-5 leading-none flex flex-col items-center text-center'
            }
          >
              <span className={'leading-none'}>
                {t('cta.request_card')}
              </span>
          </Link>
        </div>
      </div>
      <div className="image-cover w-full md:max-w-[40%]">
        <div className="relative w-full max-w-[400px] overflow-hidden rounded md:max-w-[500px]">
          <iframe
            className={'absolut left-0 top-0 aspect-[1440/1080] size-full max-w-full object-cover'}
            src="https://player.vimeo.com/video/1023725393?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
            width="1440" height="1080" allow="autoplay; picture-in-picture; clipboard-write"
            title="Présentation carte consulaire"></iframe>
        </div>
        <script src="https://player.vimeo.com/api/player.js"></script>
      </div>
      <div className="image absolute -right-16 bottom-0 -z-10 w-full max-w-[50%] md:hidden">
        <Image
          src={imagePicture}
          alt={'business card cover'}
          style={{ objectFit: 'cover' }}
          className={'!h-full !w-full object-cover'}
          width={400}
          height={600}
        />
      </div>
    </div>
  )
}