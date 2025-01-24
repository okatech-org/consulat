import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUp, HomeIcon, TimerIcon } from 'lucide-react';
import { DotsVerticalIcon } from '@radix-ui/react-icons';

interface Props {
  closePrompt: () => void;
  doNotShowAgain: () => void;
}

export default function AddToBrowser(props: Props) {
  const { closePrompt, doNotShowAgain } = props;
  const t = useTranslations('add_to_browser');

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-3/5 px-4 pt-12 text-white">
      <ArrowUp className="absolute right-[10px] top-[10px] z-10 animate-bounce text-4xl text-indigo-700" />
      <div className="relative flex h-full flex-col items-center justify-around rounded-xl bg-primary p-4 text-center">
        <button className="absolute right-0 top-0 p-3" onClick={closePrompt}>
          <TimerIcon className="text-2xl" />
        </button>
        <p className="text-lg">{t('best_experience')}</p>
        <div className="flex items-center gap-2 text-lg">
          <p>{t('click_the')}</p>
          <DotsVerticalIcon className="text-4xl" />
          <p>{t('icon')}</p>
        </div>
        <div className="flex w-full flex-col items-center gap-2 px-4 text-lg">
          <p>{t('scroll_and_click')}</p>
          <div className="flex w-full items-center justify-between rounded-lg bg-zinc-50 px-4 py-2 text-zinc-900">
            <HomeIcon className="text-2xl" />
            <p>{t('add_to_home_screen')}</p>
          </div>
        </div>
        <button className="border-2 p-1" onClick={doNotShowAgain}>
          {t('dont_show_again')}
        </button>
      </div>
    </div>
  );
}
