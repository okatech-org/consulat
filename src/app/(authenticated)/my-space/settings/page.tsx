import { PageContainer } from '@/components/layouts/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserSettingsPage() {
  return (
    <PageContainer
      title="Paramètres"
      description="Gérez vos préférences et paramètres de compte"
    >
      <Card>
        <CardHeader>
          <CardTitle>Paramètres utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Page des paramètres en cours de développement.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
