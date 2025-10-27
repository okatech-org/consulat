'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProfileListItem } from '@/convex/lib/types';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

// Helper function to get initials from a name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

interface ProfilesListProps {
  profiles: ProfileListItem[];
}

export default function ProfilesList({ profiles }: ProfilesListProps) {
  if (!profiles.length) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Aucun profil disponible</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <Link href={`/listing/profiles/${profile.id}`} key={profile.id}>
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                {profile.IDPictureUrl ? (
                  <AvatarImage
                    src={profile.IDPictureUrl}
                    alt={`${profile.firstName} ${profile.lastName}`}
                  />
                ) : (
                  <AvatarFallback>
                    {getInitials(`${profile.firstName} ${profile.lastName}`)}
                  </AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="line-clamp-1">
                {profile.firstName} {profile.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile.birthDate && (
                <p className="text-sm text-muted-foreground">
                  Âge:{' '}
                  {new Date().getFullYear() - new Date(profile.birthDate).getFullYear()}{' '}
                  ans
                </p>
              )}
              {profile.countryCode && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.countryCode}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
