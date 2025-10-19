import type { Doc } from '@/convex/_generated/dataModel';
import { ChildProfileCard } from './child-profile-card';

interface ChildrenListProps {
  profiles: Doc<'childProfiles'>[];
}

export function ChildrenList({ profiles }: ChildrenListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <ChildProfileCard key={profile._id} child={profile} />
      ))}
    </div>
  );
}
