'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Send, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useChatHistory } from '@/hooks/use-chat-history';
import { useLocale, useTranslations } from 'next-intl';
import { LoadingState } from '@/components/ui/loading-state';
import { getChatCompletion, getUserContextData, storeQuestion } from '@/lib/ai/actions';
import {
  ChatCompletionContentPartRefusal,
  ChatCompletionContentPartText,
  ChatCompletionContentPart,
} from 'openai/resources';
import { ContextBuilder } from '@/lib/ai/context-builder';
import { useCurrentUser } from '@/hooks/use-current-user';
import ReactMarkdown from 'react-markdown';
import { ContextData } from '@/lib/ai/types';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

type MessageContent =
  | string
  | ChatCompletionContentPartText[]
  | ChatCompletionContentPart[]
  | (ChatCompletionContentPartText | ChatCompletionContentPartRefusal)[]
  | null
  | undefined;

export function ChatWindow() {
  const t = useTranslations('common.chatbot');
  const currentUser = useCurrentUser();
  const [previousContext, setPreviousContext] = useState<ContextData | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputLength = input.trim().length;
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const { history, addMessage, clearHistory } = useChatHistory();

  // Function to send message
  const sendMessage = async (message: string) => {
    setIsLoading(true);
    addMessage({ role: 'user', content: message }); // Add user message to history

    const contextData =
      previousContext ??
      (await getUserContextData(locale, currentUser?.id, currentUser?.role));

    if (previousContext === null) {
      setPreviousContext(contextData);
    }

    const context = ContextBuilder.buildContext(contextData);

    const aiResponse = await getChatCompletion(message, context, history);
    setIsLoading(false);

    if (currentUser && currentUser.role === 'USER') {
      await storeQuestion(message);
    }

    if (!currentUser && history.length === 5) {
      addMessage({
        role: 'assistant',
        content: t('please_login'), // "Please login to continue the conversation."
      });

      return;
    }

    if (aiResponse) {
      addMessage({ role: 'assistant', content: aiResponse }); // Add assistant response to history
    } else {
      // Handle error or no response
      addMessage({
        role: 'assistant',
        content: t('error_message'), // "Sorry, there was an error processing your request."
      });
    }
  };

  function renderMessageContent(content: MessageContent): React.ReactNode {
    if (Array.isArray(content)) {
      return content.map((part, index) => {
        if ('text' in part) {
          return <ReactMarkdown key={index}>{part.text}</ReactMarkdown>;
        } else if ('refusal' in part) {
          return <ReactMarkdown key={index}>{part.refusal}</ReactMarkdown>;
        }
        return null;
      });
    }
    return content;
  }

  useLayoutEffect(() => {
    sessionStorage.setItem('consular_chat_context', JSON.stringify(previousContext));
  }, [previousContext]);

  useLayoutEffect(() => {
    const storedContext = sessionStorage.getItem('consular_chat_context');
    if (storedContext) {
      setPreviousContext(JSON.parse(storedContext));
    }
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
  }, [history]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-row items-center space-x-4">
        <Avatar>
          <AvatarImage src="/avatars/ray.png" alt="Ray Avatar" />
          <AvatarFallback>Ray</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">{t('chat_with_ray')}</p>
          <p className="text-sm text-muted-foreground">
            {isLoading ? t('typing') : 'Online'}
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-4 py-2" ref={chatWindowRef}>
        <div className="space-y-4">
          {history.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                message.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-muted',
              )}
            >
              {renderMessageContent(message.content)}
            </div>
          ))}
          {isLoading && <LoadingState centered={false} />}
        </div>
      </div>
      <div className="px-4 py-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (inputLength === 0) return;
            sendMessage(input);
            setInput('');
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder={t('input_placeholder')} // "Ask me anything about consular services..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isLoading || (!currentUser && history.length === 5)}
          />
          <Button type="submit" size="icon" disabled={isLoading || inputLength === 0}>
            <Send className="size-4" />
            <span className="sr-only">{t('send')}</span>
          </Button>
          <Button
            type="button"
            size="icon"
            disabled={
              isLoading || history.length === 0 || (!currentUser && history.length === 5)
            }
            onClick={clearHistory}
          >
            <X className="size-4" />
            <span className="sr-only">{t('clear')}</span>
          </Button>
        </form>

        {!currentUser && history.length === 5 && (
          <div className={'flex flex-col pt-4 gap-2 items-center'}>
            <Button asChild className={'w-full'}>
              <Link href={ROUTES.user.base}>{t('login')}</Link>
            </Button>
            <p>{t('please_login')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
