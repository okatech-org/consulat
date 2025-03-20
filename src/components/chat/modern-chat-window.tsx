'use client';

import { useRef, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import { useChat } from '@/contexts/chat-context';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ModernChatWindowProps {
  className?: string;
  initialMessages?: Message[];
  onSendMessage?: (message: string) => Promise<string>;
  botName?: string;
  botAvatarUrl?: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export function ModernChatWindow({
  className,
  initialMessages = [],
  onSendMessage,
  botName = 'Ray',
  botAvatarUrl = '/images/avatar-placeholder.png',
}: ModernChatWindowProps) {
  const t = useTranslations('chat');
  const { closeChat } = useChat();
  const [chatState, setChatState] = useState<ChatState>({
    messages: initialMessages || [],
    isLoading: false,
  });

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // load chat history from session storage
  useEffect(() => {
    const chatHistory = sessionStorage.getItem('chatHistory');
    if (chatHistory) {
      setChatState((prev) => ({ ...prev, messages: JSON.parse(chatHistory) }));
    }
  }, []);

  // Auto-scroll au chargement et quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // Ajuster la hauteur du textarea automatiquement
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  // Détecter quand l'utilisateur scrolle pour afficher/cacher le bouton de défilement
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const addMessage = (content: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
    };

    const newMessages = [...chatState.messages, newMessage];

    sessionStorage.setItem('chatHistory', JSON.stringify(newMessages));

    setChatState((prev) => ({
      ...prev,
      messages: newMessages,
    }));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || chatState.isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Ajouter le message utilisateur
    addMessage(userMessage, 'user');

    if (onSendMessage) {
      setChatState((prev) => ({ ...prev, isLoading: true }));

      try {
        const response = await onSendMessage(userMessage);
        addMessage(response, 'bot');
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        addMessage(t('error_message') || 'Une erreur est survenue', 'bot');
      } finally {
        setChatState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cette fonction transforme le texte avec formatage markdown en HTML
  const formatMessage = (text: string): string => {
    if (!text) return '';

    // Échapper les caractères HTML pour éviter les injections
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Diviser le contenu en blocs pour traiter différents types de contenus
    const blocks = formatted.split(/\n\s*\n/);
    const formattedBlocks = blocks.map((block) => {
      // Traiter les listes à puces
      if (/^- /m.test(block)) {
        const lines = block.split('\n');
        const listItems = lines
          .filter((line) => line.trim().startsWith('- '))
          .map((line) => `<li>${line.replace(/^- /, '')}</li>`)
          .join('');
        return `<ul class="list-disc pl-5 my-2">${listItems}</ul>`;
      }

      // Traiter les listes numérotées
      if (/^\d+\. /m.test(block)) {
        const lines = block.split('\n');
        const listItems = lines
          .filter((line) => /^\d+\. /.test(line.trim()))
          .map((line) => `<li>${line.replace(/^\d+\. /, '')}</li>`)
          .join('');
        return `<ol class="list-decimal pl-5 my-2">${listItems}</ol>`;
      }

      // Traiter les paragraphes normaux avec sauts de ligne
      return `<p class="mb-2">${block.replace(/\n/g, '<br>')}</p>`;
    });

    // Rejoindre les blocs
    formatted = formattedBlocks.join('');

    // Traiter le formatage en gras
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Traiter les liens
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-primary underline font-medium hover:text-primary/80" target="_blank" rel="noopener noreferrer">$1</a>',
    );

    // Assainir le HTML pour éviter les injections
    return DOMPurify.sanitize(formatted, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'ul', 'ol', 'li', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col h-[600px] w-full max-w-3xl mx-auto bg-background rounded-lg border shadow-lg overflow-hidden',
        className,
      )}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={botAvatarUrl} alt={botName} />
            <AvatarFallback>{botName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{botName}</h3>
            <p className="text-xs text-muted-foreground">
              {t('assistant_description') || 'Assistant consulaire'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={closeChat}>
          <X className="!size-6" />
        </Button>
      </div>

      {/* Corps des messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/20"
        style={{ scrollBehavior: 'smooth' }}
      >
        {chatState.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-80">
            <div className="max-w-md">
              <h3 className="text-lg font-medium mb-2">
                {t('welcome_title') || 'Bienvenue'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('welcome_description') || "Comment puis-je vous aider aujourd'hui?"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {chatState.messages.map((message) => {
              const isBot = message.sender === 'bot';
              return (
                <div
                  key={message.id}
                  className={cn(
                    'group flex gap-3 relative message-enter',
                    isBot ? '' : 'justify-end',
                  )}
                >
                  {isBot && (
                    <div className="flex-shrink-0 pt-1">
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src={botAvatarUrl} alt={botName} />
                        <AvatarFallback>{botName[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  )}

                  <div
                    className={cn(
                      'relative max-w-[85%] px-4 py-3 rounded-lg break-words',
                      isBot
                        ? 'bg-card text-card-foreground shadow-sm'
                        : 'bg-primary text-primary-foreground',
                    )}
                  >
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none claude-markdown-content"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />

                    <span className="block mt-1 text-[10px] opacity-60 text-right">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {!isBot && (
                    <div className="flex-shrink-0 pt-1">
                      <Avatar className="h-8 w-8 bg-primary/10 border">
                        <AvatarFallback className="text-primary-foreground">
                          U
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Indicateur de chargement */}
            {chatState.isLoading && (
              <div className="flex items-start gap-3 message-enter">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={botAvatarUrl} alt={botName} />
                  <AvatarFallback>{botName[0]}</AvatarFallback>
                </Avatar>
                <div className="bg-card text-card-foreground rounded-lg p-3 shadow-sm">
                  <div className="flex space-x-2 items-center h-5 min-w-24">
                    <div className="w-2 h-2 rounded-full bg-foreground/30 typing-dot"></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/30 typing-dot"></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/30 typing-dot"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Référence pour le défilement automatique */}
            <div ref={messagesEndRef} className="h-1" />
          </>
        )}
      </div>

      {/* Bouton de défilement vers le bas */}
      {showScrollButton && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          variant="secondary"
          className="absolute bottom-20 right-4 rounded-full h-10 w-10 shadow-md opacity-90 hover:opacity-100"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}

      {/* Saisie de message */}
      <div className="p-4 border-t bg-background">
        <div className="relative flex items-end max-w-3xl mx-auto rounded-lg border bg-background overflow-hidden">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('input_placeholder') || 'Posez votre question...'}
            className="min-h-[50px] max-h-[120px] border-0 focus-visible:ring-0 resize-none pr-14 py-3"
            rows={1}
            disabled={chatState.isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || chatState.isLoading}
            size="icon"
            className="absolute bottom-1.5 right-1.5 h-8 w-8 rounded-full"
          >
            {chatState.isLoading ? (
              <Loader2 className="size-icon animate-spin" />
            ) : (
              <Send className="size-icon" />
            )}
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2 px-2">
          {t('disclaimer') ||
            'Les informations fournies sont à titre indicatif. Contactez le consulat pour confirmation.'}
        </p>
      </div>
    </div>
  );
}
