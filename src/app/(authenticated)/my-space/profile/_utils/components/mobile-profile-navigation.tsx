'use client';

import { Fragment, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateProfileCompletion, cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { RequestsSection } from './sections/requests-section';
import { CheckCircle2, Circle, Save } from 'lucide-react';
import type { CompleteProfile } from '@/convex/lib/types';
import type { Doc } from '@/convex/_generated/dataModel';
import { BasicInfoDisplay } from './sections/basic-info-display';
import { ContactInfoDisplay } from './sections/contact-info-display';
import { UserDocument } from '@/components/documents/user-document';
import { FamilyInfoDisplay } from './sections/family-info-display';
import { ProfessionalInfoDisplay } from './sections/professional-info-display';
import { DocumentType } from '@/convex/lib/constants';

type MobileProfileNavigationProps = {
  profile: CompleteProfile;
  requestId?: string;
  requests?: Doc<'requests'>[];
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
  const t_common = useTranslations('common');
  const completion = calculateProfileCompletion(profile);
  const [openSections, setOpenSections] = useState<string[]>(['basic-info']);
  const [modifiedSections, setModifiedSections] = useState<Set<string>>(new Set());

  const handleSectionModified = (sectionId: string) => {
    setModifiedSections((prev) => new Set(prev).add(sectionId));
  };

  const profileTabs = [
    {
      id: 'basic-info',
      title: t('sections.basic_info'),
      content: <BasicInfoDisplay profile={profile} />,
    },
    {
      id: 'contact-info',
      title: t('sections.contact_info'),
      content: <ContactInfoDisplay profile={profile} />,
    },
    {
      id: 'family-info',
      title: t('sections.family_info'),
      content: <FamilyInfoDisplay profile={profile} />,
    },
    {
      id: 'professional-info',
      title: t('sections.professional_info'),
      content: <ProfessionalInfoDisplay profile={profile} />,
    },
    {
      id: 'documents',
      title: t('sections.documents'),
      content: (
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            profile.passport,
            profile.birthCertificate,
            profile.residencePermit,
            profile.addressProof,
          ]
            .filter(Boolean)
            .map((document) => (
              <Fragment key={document?._id}>
                <UserDocument
                  label={t_common(`documents.types.${document?.type}`)}
                  description={t_common(`documents.descriptions.${document?.type}`)}
                  document={document}
                  expectedType={document?.type}
                  allowEdit={true}
                  required
                  noFormLabel={true}
                  enableBackgroundRemoval={DocumentType.IdentityPhoto === document?.type}
                  requestId={requestId}
                />
              </Fragment>
            ))}
        </div>
      ),
    },
  ];

  if (requests) {
    profileTabs.push({
      id: 'requests',
      title: t('sections.requests'),
      content: <RequestsSection requests={requests} />,
    });
  }

  const getSectionCompletionInfo = (sectionId: string) => {
    const section = completion.sections.find((s) => s.name === sectionId);
    if (!section) return null;
    return {
      percentage: section.completion,
      isComplete: section.completion === 100,
      missingFields: section.missingFields,
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
        {profileTabs.map((section) => {
          const completionInfo = getSectionCompletionInfo(section.id);
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
