import { ChildProfileCard } from './child-profile-card';
import type { UserData } from '@/types/role-data';

interface ChildrenListProps {
  authorities: UserData['children'];
}

export function ChildrenList({ authorities }: ChildrenListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {authorities.map((authority) => (
        <ChildProfileCard key={authority.id} child={authority} />
      ))}
    </div>
  );
}
