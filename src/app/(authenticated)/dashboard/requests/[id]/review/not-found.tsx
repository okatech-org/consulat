import { NotFoundComponent } from '@/components/ui/not-found';

export default function NotFound() {
  return (
    <NotFoundComponent description="La demande que vous cherchez n'existe pas ou vous n'avez pas les permissions pour la voir." />
  );
}
