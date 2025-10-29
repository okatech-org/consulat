'use client';

import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Circle,
  HelpCircle,
  LoaderIcon,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CompleteProfile } from '@/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import {
  ProfileSuggestion,
  useProfileSuggestions,
} from '@/hooks/use-profile-suggestions';
import type { CompleteProfile, UserData } from '@/convex/lib/types';

export function ProfileCompletionAssistant({
  profile,
  user,
}: {
  profile: CompleteProfile;
  user: UserData;
}) {
  const t = useTranslations('profile.assistant');
  const [isOpen, setIsOpen] = useState(false);
  const { suggestions, isLoading, error } = useProfileSuggestions(profile, user);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          <div className="flex items-center gap-2">
            <Bot className="size-4" />
            {t('title')}
          </div>
        </CardTitle>
        {!isLoading && suggestions.length === 0 && (
          <CheckCircle2 className="text-success size-5" />
        )}
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span>
                {isLoading
                  ? t('analyzing')
                  : isOpen
                    ? t('hide_suggestions')
                    : t('show_suggestions')}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <LoaderIcon className="size-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="size-4" />
                <p>{error}</p>
              </div>
            ) : suggestions.length === 0 ? (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground"
              >
                {t('no_suggestions')}
              </motion.p>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {suggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))}
              </motion.div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Composant pour afficher une suggestion
function SuggestionCard({ suggestion }: { suggestion: ProfileSuggestion }) {
  const t = useTranslations('profile.assistant');

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <XCircle className="size-4 text-destructive" />;
      case 'medium':
        return <HelpCircle className="text-warning size-4" />;
      case 'low':
        return <Circle className="size-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2 rounded-lg border p-2"
    >
      {getPriorityIcon(suggestion.priority)}
      <div className="flex-1">
        <p className="text-sm">{suggestion.message}</p>
        {suggestion.action && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={() => {
              // Implémenter la logique d'action
            }}
            disabled={true}
          >
            {t(`actions.${suggestion.action.type}`)}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
