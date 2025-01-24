'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { setCookie, getCookie } from 'cookies-next';
import dynamic from 'next/dynamic';
import useUserAgent from '@/hooks/use-user-agent';

const ModuleLoading = () => {
  const t = useTranslations('add_to_home_screen');
  return <p className="animate-bounce font-bold text-white">{t('loading')}</p>;
};

const AddToBrowser = dynamic(() => import('./add-to-browser'), {
  loading: () => <ModuleLoading />,
});

type AddToHomeScreenPromptType =
  | 'safari'
  | 'chrome'
  | 'firefox'
  | 'other'
  | 'firefoxIos'
  | 'chromeIos'
  | 'samsung'
  | '';
const COOKIE_NAME = 'addToHomeScreenPrompt';

export default function AddToHomeScreen() {
  const [displayPrompt, setDisplayPrompt] = useState<AddToHomeScreenPromptType>('');
  const { userAgent, isMobile, isStandalone, isIOS } = useUserAgent();

  const closePrompt = () => {
    setDisplayPrompt('');
  };

  const doNotShowAgain = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    setCookie(COOKIE_NAME, 'dontShow', { expires: date });
    setDisplayPrompt('');
  };

  useEffect(() => {
    const addToHomeScreenPromptCookie = getCookie(COOKIE_NAME);

    if (addToHomeScreenPromptCookie !== 'dontShow') {
      if (isMobile && !isStandalone) {
        switch (userAgent) {
          case 'Safari':
            setDisplayPrompt('safari');
            break;
          case 'Chrome':
            setDisplayPrompt('chrome');
            break;
          case 'Firefox':
            setDisplayPrompt('firefox');
            break;
          case 'FirefoxiOS':
            setDisplayPrompt('firefoxIos');
            break;
          case 'ChromeiOS':
            setDisplayPrompt('chromeIos');
            break;
          case 'SamsungBrowser':
            setDisplayPrompt('samsung');
            break;
          default:
            setDisplayPrompt('other');
            break;
        }
      }
    }
  }, [userAgent, isMobile, isStandalone, isIOS]);

  const Prompt = () => (
    <>
      {
        {
          safari: (
            <AddToBrowser closePrompt={closePrompt} doNotShowAgain={doNotShowAgain} />
          ),
          chrome: (
            <AddToBrowser closePrompt={closePrompt} doNotShowAgain={doNotShowAgain} />
          ),
          firefox: (
            <AddToBrowser closePrompt={closePrompt} doNotShowAgain={doNotShowAgain} />
          ),
          firefoxIos: (
            <AddToBrowser closePrompt={closePrompt} doNotShowAgain={doNotShowAgain} />
          ),
          chromeIos: (
            <AddToBrowser closePrompt={closePrompt} doNotShowAgain={doNotShowAgain} />
          ),
          samsung: (
            <AddToBrowser closePrompt={closePrompt} doNotShowAgain={doNotShowAgain} />
          ),
          other: (
            <AddToBrowser closePrompt={closePrompt} doNotShowAgain={doNotShowAgain} />
          ),
          '': <></>,
        }[displayPrompt]
      }
    </>
  );

  return (
    <>
      {displayPrompt !== '' ? (
        <div className="fixed inset-0 z-50 bg-black/70" onClick={closePrompt}>
          <Prompt />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
