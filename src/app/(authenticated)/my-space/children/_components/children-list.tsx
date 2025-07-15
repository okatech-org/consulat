import { ChildProfileCard } from './child-profile-card';
import type { ChildProfileCardData } from '@/types/parental-authority';

interface ChildrenListProps {
  parentalAuthorities: ChildProfileCardData[];
}

export function ChildrenList({ parentalAuthorities }: ChildrenListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {parentalAuthorities.map((authority) => (
        <ChildProfileCard key={authority.id} parentalAuthority={authority} />
      ))}
    </div>
  );
}
