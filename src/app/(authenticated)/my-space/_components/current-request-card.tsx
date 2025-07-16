'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, MessageSquare, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useTranslations } from 'next-intl';

interface CurrentRequestCardProps {
  request: {
    id: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    service: { name: string };
    assignedTo?: { name: string };
  };
}

export function CurrentRequestCard({ request }: CurrentRequestCardProps) {
  const t = useTranslations('dashboard.unified.current_request');
  
  const getProgress = (status: string) => {
    const progressMap = {
      DRAFT: 0,
      SUBMITTED: 20,
      VALIDATED: 40,
      PROCESSING: 60,
      COMPLETED: 100,
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      PROCESSING: 'bg-amber-500/20 text-amber-700 border-amber-300',
      VALIDATED: 'bg-blue-500/20 text-blue-700 border-blue-300',
      COMPLETED: 'bg-green-500/20 text-green-700 border-green-300',
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-500/20 text-gray-700 border-gray-300';
  };

  const getSteps = () => [
    { label: t('steps.request_submitted'), completed: true, date: '06/07/2025 - 14h30' },
    { label: t('steps.documents_verified'), completed: getProgress(request.status) >= 40, date: '07/07/2025 - 10h15' },
    { label: t('steps.processing'), current: request.status === 'PROCESSING', agent: request.assignedTo?.name },
    { label: t('steps.final_validation'), completed: false, status: t('steps.waiting') },
    { label: t('steps.request_completed'), completed: request.status === 'COMPLETED', status: t('steps.ready_for_pickup') },
  ];

  return (
    <Card className="overflow-hidden">
      {/* Version desktop */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 hidden md:block">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">{request.service.name}</h2>
            <p className="text-blue-100 text-sm">
              {t('submitted_ago')} {formatDistanceToNow(new Date(request.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
              {request.assignedTo && ` • ${t('assigned_to')} ${request.assignedTo.name}`}
            </p>
          </div>
          <Badge className={`${getStatusColor(request.status)} text-xs`}>
            {request.status === 'PROCESSING' ? t('status.processing') : t(`status.${request.status.toLowerCase()}`)}
          </Badge>
        </div>

        <div className="mb-6">
          <Progress value={getProgress(request.status)} className="h-2 mb-3" />
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-center">✓ {t('progress.submitted')}</div>
            <div className="text-center">✓ {t('progress.verified')}</div>
            <div className="text-center font-semibold">• {t('progress.in_processing')}</div>
            <div className="text-center opacity-70">{t('progress.validation')}</div>
            <div className="text-center opacity-70">{t('progress.completed')}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="secondary" className="bg-white text-blue-900">
            <Link href={ROUTES.user.service_request_details(request.id)}>
              <Eye className="mr-2 h-4 w-4" />
              {t('actions.view_details')}
            </Link>
          </Button>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <MessageSquare className="mr-2 h-4 w-4" />
            {t('actions.contact_agent')}
          </Button>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <FileText className="mr-2 h-4 w-4" />
            {t('actions.add_document')}
          </Button>
        </div>
      </div>

      {/* Version mobile */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4 md:hidden">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold mb-1">{request.service.name}</h2>
          <p className="text-blue-100 text-xs mb-2">
            {t('submitted_ago')} {formatDistanceToNow(new Date(request.createdAt), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
          <Badge className={`${getStatusColor(request.status)} text-xs`}>
            {request.status === 'PROCESSING' ? t('status.processing') : t(`status.${request.status.toLowerCase()}`)}
          </Badge>
        </div>

        {/* Progression verticale mobile */}
        <div className="space-y-2 mb-4">
          {getSteps().map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                step.completed
                  ? 'bg-green-500/20 border-green-400'
                  : step.current
                  ? 'bg-white/20 border-white'
                  : 'bg-white/5 border-white/30'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : step.current
                    ? 'bg-white text-blue-900'
                    : 'bg-white/30 text-white'
                }`}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{step.label}</div>
                <div className="text-xs opacity-80">
                  {step.date || (step.agent ? `${t('steps.by')} ${step.agent}` : step.status || t('steps.waiting'))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button asChild className="w-full bg-white text-blue-900">
            <Link href={ROUTES.user.service_request_details(request.id)}>
              <Eye className="mr-2 h-4 w-4" />
              {t('actions.view_details')}
            </Link>
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="border-white/30 text-white">
              <MessageSquare className="mr-1 h-4 w-4" />
              {t('actions.contact')}
            </Button>
            <Button variant="outline" className="border-white/30 text-white">
              <FileText className="mr-1 h-4 w-4" />
              {t('actions.document')}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}