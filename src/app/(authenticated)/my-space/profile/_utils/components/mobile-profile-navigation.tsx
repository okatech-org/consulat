'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BasicInfoSection } from './sections/basic-info-section';
import { ContactInfoSection } from './sections/contact-info-section';
import { DocumentsSection } from './sections/documents-section';
import { FamilyInfoSection } from './sections/family-info-section';
import { ProfessionalInfoSection } from './sections/professional-info-section';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { ServiceRequest } from '@prisma/client';
import { RequestsSection } from './sections/requests-section';
import { useProfileCompletion } from '../hooks/use-profile-completion';
import {
  User,
  Phone,
  Users,
  Briefcase,
  FileText,
  ClipboardList,
  CheckCircle2,
  Circle,
  Save,
} from 'lucide-react';
import type { FullProfile } from '@/types/convex-profile';
import type { Doc } from '@/convex/_generated/dataModel';

type MobileProfileNavigationProps = {
  profile: FullProfile;
  requestId?: string;
  requests?: Doc<'requests'>[];
};

const sectionIcons = {
  'basic-info': User,
  'contact-info': Phone,
  'family-info': Users,
  'professional-info': Briefcase,
  documents: FileText,
  requests: ClipboardList,
};

export function MobileProfileNavigation({
  profile,
  requestId,
  requests,
}: MobileProfileNavigationProps) {
  if (!profile) {
    return undefined;
  }

  const t = useTranslations('profile');
  const router = useRouter();
  const completion = useProfileCompletion(profile);
  const [openSections, setOpenSections] = useState<string[]>(['basic-info']);
  const [modifiedSections, setModifiedSections] = useState<Set<string>>(new Set());

  const handleSectionSave = (sectionId: string) => {
    router.refresh();
    setModifiedSections((prev) => {
      const newSet = new Set(prev);
      newSet.delete(sectionId);
      return newSet;
    });
  };

  const handleSectionModified = (sectionId: string) => {
    setModifiedSections((prev) => new Set(prev).add(sectionId));
  };

  const profileSections = [
    {
      id: 'basic-info',
      title: t('sections.basic_info'),
      content: (
        <BasicInfoSection
          profile={profile}
          onSaveAction={() => handleSectionSave('basic-info')}
        />
      ),
    },
    {
      id: 'contact-info',
      title: t('sections.contact_info'),
      content: (
        <ContactInfoSection
          profile={profile}
          onSave={() => handleSectionSave('contact-info')}
          requestId={requestId}
        />
      ),
    },
    {
      id: 'family-info',
      title: t('sections.family_info'),
      content: (
        <FamilyInfoSection
          profile={profile}
          onSave={() => handleSectionSave('family-info')}
          requestId={requestId}
        />
      ),
    },
    {
      id: 'professional-info',
      title: t('sections.professional_info'),
      content: (
        <ProfessionalInfoSection
          profile={profile}
          onSave={() => handleSectionSave('professional-info')}
          requestId={requestId}
        />
      ),
    },
    {
      id: 'documents',
      title: t('sections.documents'),
      content: (
        <DocumentsSection
          documents={{
            passport: profile.passport,
            birthCertificate: profile.birthCertificate,
            residencePermit: profile.residencePermit,
            addressProof: profile.addressProof,
          }}
          profileId={profile._id}
          onSave={() => handleSectionSave('documents')}
        />
      ),
    },
  ];

  if (requests) {
    profileSections.push({
      id: 'requests',
      title: t('sections.requests'),
      content: <RequestsSection requests={requests} />,
    });
  }

  const getSectionCompletionInfo = (sectionId: string) => {
    const section = completion.sections.find((s) => s.name === sectionId);
    if (!section) return null;
    return {
      percentage: section.percentage,
      isComplete: section.percentage === 100,
    };
  };

  return (
    <div className="space-y-4">
      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={setOpenSections}
        className="space-y-2"
      >
        {profileSections.map((section) => {
          const completionInfo = getSectionCompletionInfo(section.id);
          const Icon = sectionIcons[section.id as keyof typeof sectionIcons];
          const isModified = modifiedSections.has(section.id);

          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className={cn(
                'border rounded-lg px-4',
                isModified && 'border-warning',
                'data-[state=open]:border-primary',
              )}
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full mr-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'rounded-full p-2',
                        completionInfo?.isComplete ? 'bg-green-100' : 'bg-gray-100',
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            completionInfo?.isComplete
                              ? 'text-green-600'
                              : 'text-gray-600',
                          )}
                        />
                      )}
                    </div>
                    <span className="font-medium text-left">{section.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isModified && (
                      <Badge variant="warning" className="text-xs">
                        Non sauvegardé
                      </Badge>
                    )}
                    {completionInfo && (
                      <>
                        {completionInfo.isComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="flex items-center gap-1">
                            <Circle className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-muted-foreground">
                              {completionInfo.percentage}%
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <div
                  onChange={() => handleSectionModified(section.id)}
                  className="space-y-4"
                >
                  {section.content}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Sticky Save Button */}
      {modifiedSections.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg z-50 md:hidden">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={() => {
              // Trigger save on all modified sections
              modifiedSections.forEach((sectionId) => {
                const section = document.querySelector(`[data-section="${sectionId}"]`);
                if (section) {
                  const saveButton = section.querySelector('button[type="submit"]');
                  if (saveButton instanceof HTMLButtonElement) {
                    saveButton.click();
                  }
                }
              });
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les modifications ({modifiedSections.size})
          </Button>
        </div>
      )}
    </div>
  );
}
