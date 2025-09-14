'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ProfileIntelligenceDetailsPageProps {
  profileId: string;
}

export function ProfileIntelligenceDetailsPage({
  profileId,
}: ProfileIntelligenceDetailsPageProps) {
  const router = useRouter();
  
  const { data: profile, isLoading } = api.intelligence.getProfileDetails.useQuery({
    profileId,
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!profile) {
    return <div>Profil non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={() => router.back()}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <h1 className="text-3xl font-bold mt-8">
          {profile.firstName} {profile.lastName}
        </h1>
        
        <p>ID: {profileId}</p>
      </div>
    </div>
  );
}
