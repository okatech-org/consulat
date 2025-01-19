
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslations } from 'next-intl'
import { Send } from 'lucide-react'
import { Icons } from '../ui/icons'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { SessionManager } from '@/lib/ai/session-manager'
import { chatWithAssistant } from '@/lib/ai/actions'

type Message = {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
}

export function ChatWindow() {
  const t = useTranslations('chatbot')
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const loadChatHistory = () => {
      try {
        const history = SessionManager.getCurrentSession();

        if (history && history.messages.length > 0) {
          // Convertir l'historique en messages avec timestamps
          const formattedHistory = history.messages.map((msg, index) => ({
            id: index.toString(),
            content: msg.content,
            role: msg.role,
            timestamp: new Date(Date.now() - (history.messages.length - index) * 1000) // Timestamps approximatifs
          }));

          setMessages(formattedHistory);
        } else {
          // Message de bienvenue si pas d'historique
          setMessages([
            {
              id: '0',
              content: t('welcome_message'),
              role: 'assistant',
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // En cas d'erreur, afficher quand même le message de bienvenue
        setMessages([
          {
            id: '0',
            content: t('welcome_message'),
            role: 'assistant',
            timestamp: new Date(),
          },
        ]);
      }
    };

    loadChatHistory();
  }, [t])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await chatWithAssistant(input)

      if (response.error) {
        throw new Error(response.error)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message || t('error_message'),
        role: 'assistant',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: t('error_message'),
        role: 'assistant',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={"flex flex-col gap-4 h-full"}>
      <ScrollArea className="overflow-y-auto overflow-x-hidden h-[100%] pr-4">
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2',
                message.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
              <span className="text-xs opacity-50">
                  {message.timestamp.toLocaleTimeString()}
                </span>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icons.Spinner className="size-4 animate-spin" />
              {t('typing')}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('input_placeholder')}
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Icons.Spinner className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          <span className="sr-only">{t('send')}</span>
        </Button>
      </form>
    </div>
  )
}