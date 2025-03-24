import { getCountries } from '@/actions/countries';
import { tryCatch } from '@/lib/utils';
import { notFound } from 'next/navigation';
import React from 'react';

interface ServiceCreationLayoutProps {
  children: React.ReactNode;
}

export default async function ServiceCreationLayout({
  children,
}: ServiceCreationLayoutProps) {
  const { data: countries, error } = await tryCatch(getCountries());

  if (error || !countries) {
    notFound();
  }

  return React.cloneElement(children as React.ReactElement, { countries });
}
