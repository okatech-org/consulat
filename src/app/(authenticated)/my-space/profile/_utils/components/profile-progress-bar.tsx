'use client';

import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';
import { useState } from 'react';
import { calculateProfileCompletion, cn } from '@/lib/utils';
import type { CompleteProfile } from '@/convex/lib/types';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';

interface ProfileProgressBarProps {
  profile: CompleteProfile | null;
  className?: string;
}

export function ProfileProgressBar({ profile, className }: ProfileProgressBarProps) {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);
  if (!profile) {
    return null;
  }
  const completion = calculateProfileCompletion(profile);

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {t('profile.progress.title')}
            </CardTitle>
            <CardDescription className="text-sm">
              {t('profile.progress.description')}
            </CardDescription>
          </div>
          <Badge
            variant={completion.overall === 100 ? 'default' : 'secondary'}
            className="text-sm font-semibold"
          >
            {completion.overall}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar Global */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t('profile.progress.completed', {
                completed: completion.completedFields,
                total: completion.totalFields,
              })}
            </span>
            {completion.overall === 100 && (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
          </div>
          <Progress
            value={completion.overall}
            className={cn(
              'h-2 transition-all duration-500',
              completion.overall === 100 && 'bg-green-100',
            )}
            indicatorClassName={cn(completion.overall === 100 && 'bg-green-600')}
          />
        </div>

        {/* Message de statut */}
        {completion.overall < 100 && (
          <Alert variant="default" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {completion.overall === 0
                ? t('profile.progress.start_message')
                : t('profile.progress.incomplete_message', {
                    percentage: completion.overall,
                  })}
            </AlertDescription>
          </Alert>
        )}

        {/* Sections détaillées */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-0 hover:bg-transparent"
              size="sm"
            >
              <span className="text-sm font-medium">
                {t('profile.progress.view_details')}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            {completion.sections.map((section) => {
              const isComplete = section.completion === 100;

              return (
                <div key={section.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {t(`profile.tabs.${section.name}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {section.completed}/{section.total}
                      </span>
                      <Badge
                        variant={isComplete ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {section.completion}%
                      </Badge>
                    </div>
                  </div>

                  {/* Barre de progression de la section */}
                  <Progress
                    value={section.completion}
                    className="h-1.5"
                    indicatorClassName={cn(isComplete && 'bg-green-600/50')}
                  />

                  {/* Champs manquants */}
                  {section.missingFields.length > 0 && (
                    <div className="pl-7">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t('profile.progress.missing_fields')}:
                      </p>
                      <ul className="text-xs space-y-0.5">
                        {section.missingFields.slice(0, 3).map((field: string) => (
                          <li key={field} className="text-red-600">
                            • {t(`profile.tabs.${field}`)}
                          </li>
                        ))}
                        {section.missingFields.length > 3 && (
                          <li className="text-muted-foreground italic">
                            {t('profile.progress.and_more', {
                              count: section.missingFields.length - 3,
                            })}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Call to Action */}
        <Link
          href={ROUTES.user.profile_form}
          className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
        >
          <Pencil className="size-icon" />
          {completion.overall < 100
            ? t('profile.progress.complete_profile')
            : t('profile.progress.edit_profile')}
        </Link>
      </CardContent>
    </Card>
  );
}
