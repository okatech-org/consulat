import React from 'react';
import { FullParentalAuthority } from '@/types/parental-authority';
import { ChildProfileCard } from './child-profile-card';

interface ChildrenListProps {
  parentalAuthorities: FullParentalAuthority[];
}

export function ChildrenList({ parentalAuthorities }: ChildrenListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {parentalAuthorities.map((authority) => (
        <ChildProfileCard key={authority.id} parentalAuthority={authority} />
      ))}
    </div>
  );
}
