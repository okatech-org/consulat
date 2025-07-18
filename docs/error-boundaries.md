# Error Boundaries - Guide d'utilisation

Cette documentation explique comment utiliser les error boundaries dans l'application Consulat.ga pour gérer les erreurs de manière élégante.

## Vue d'ensemble

L'application dispose de plusieurs niveaux d'error boundaries :

1. **Global Error Boundary** - Capture toutes les erreurs non gérées
2. **Route-specific Error Boundaries** - Gestion spécialisée par section
3. **Component-specific Error Boundaries** - Pour des composants critiques
4. **tRPC Error Boundary** - Spécialement conçu pour les erreurs API

## Structure des Error Boundaries

```
src/
├── app/
│   ├── global-error.tsx                 # Erreurs critiques globales
│   ├── (authenticated)/
│   │   ├── error.tsx                    # Erreurs section authentifiée
│   │   ├── dashboard/error.tsx          # Erreurs dashboard
│   │   └── my-space/error.tsx           # Erreurs espace utilisateur
│   └── (public)/error.tsx               # Erreurs section publique
└── components/
    ├── error-boundary.tsx               # Error boundary principal
    └── trpc-error-boundary.tsx          # Error boundary tRPC
```

## Utilisation

### 1. Error Boundary Principal

Le composant `ErrorBoundary` est le plus polyvalent :

```tsx
import ErrorBoundary from '@/components/error-boundary';

function MonComposant() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log l'erreur, envoyer à un service de monitoring
        console.error('Erreur capturée:', error);
      }}
      showErrorDetails={process.env.NODE_ENV === 'development'}
    >
      <ComposantQuiPeutEchouer />
    </ErrorBoundary>
  );
}
```

### 2. Hook useErrorBoundary

Pour déclencher une erreur programmatiquement :

```tsx
import { useErrorBoundary } from '@/components/error-boundary';

function MonComposant() {
  const { captureError } = useErrorBoundary();

  const handleAction = async () => {
    try {
      await actionRisquee();
    } catch (error) {
      captureError(error as Error);
    }
  };

  return <button onClick={handleAction}>Action</button>;
}
```

### 3. tRPC Error Boundary

Pour les composants utilisant tRPC :

```tsx
import TRPCErrorBoundary, { useTRPCErrorHandler } from '@/components/trpc-error-boundary';
import { api } from '@/trpc/react';

function ListeUtilisateurs() {
  const { handleTRPCError } = useTRPCErrorHandler();
  const { data, error } = api.users.getAll.useQuery();

  if (error) {
    handleTRPCError(error);
    return null;
  }

  return (
    <TRPCErrorBoundary>
      <div>
        {data?.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </TRPCErrorBoundary>
  );
}
```

### 4. Composant d'erreur personnalisé

Pour créer un fallback personnalisé :

```tsx
import type { ErrorFallbackProps } from '@/components/error-boundary';

function MonErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="p-4 border border-red-200 rounded-lg">
      <h3>Oups ! Une erreur est survenue</h3>
      <p>{error?.message}</p>
      <button onClick={resetError}>Réessayer</button>
    </div>
  );
}

// Utilisation
<ErrorBoundary fallback={MonErrorFallback}>
  <ComposantRisque />
</ErrorBoundary>;
```

## Types d'erreurs gérées

### 1. Erreurs réseau

- Messages d'erreur appropriés
- Boutons de retry
- Détection automatique des problèmes de connectivité

### 2. Erreurs d'autorisation

- Redirection vers la page de connexion
- Messages clairs sur les permissions

### 3. Erreurs de validation

- Affichage des erreurs de formulaire
- Messages spécifiques par champ

### 4. Erreurs de chunk (mise à jour)

- Détection des nouvelles versions de l'app
- Bouton de rechargement pour obtenir la dernière version

## Traductions

Les messages d'erreur sont traduits via `next-intl`. Structure dans `/src/i18n/messages/fr/errors.ts` :

```typescript
export default {
  common: {
    error_title: 'Erreur',
    try_again: 'Réessayer',
    go_home: "Retour à l'accueil",
    report_error: 'Signaler cette erreur',
  },
  network: {
    title: 'Problème de connexion',
    description: 'Impossible de se connecter au serveur.',
  },
  chunk: {
    title: 'Mise à jour disponible',
    description: 'Une nouvelle version est disponible.',
    reload: 'Recharger',
  },
  // ...
};
```

## Bonnes pratiques

### 1. Placement stratégique

- Placer les error boundaries autour des sections critiques
- Ne pas sur-utiliser (performance)
- Utiliser au niveau des features, pas des composants individuels

### 2. Gestion des erreurs

```tsx
// ✅ Bon
<ErrorBoundary>
  <FeatureComplexe />
</ErrorBoundary>

// ❌ Éviter
<ErrorBoundary>
  <Button />
</ErrorBoundary>
```

### 3. Logging et monitoring

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Envoyer à un service de monitoring
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'exception', {
        description: error.toString(),
        fatal: false,
      });
    }
  }}
>
  <MonComposant />
</ErrorBoundary>
```

### 4. Fallbacks contextuels

```tsx
// Pour une liste
<ErrorBoundary fallback={ListeErrorFallback}>
  <ListeUtilisateurs />
</ErrorBoundary>

// Pour un formulaire
<ErrorBoundary fallback={FormulaireErrorFallback}>
  <FormulaireInscription />
</ErrorBoundary>
```

## Testing

### Test unitaire d'un error boundary

```tsx
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/error-boundary';

const ThrowError = () => {
  throw new Error('Test error');
};

test("affiche le fallback en cas d'erreur", () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>,
  );

  expect(screen.getByText(/erreur/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument();
});
```

## Intégration avec des services de monitoring

### Sentry

```tsx
import * as Sentry from '@sentry/nextjs';

<ErrorBoundary
  onError={(error, errorInfo) => {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }}
>
  <MonComposant />
</ErrorBoundary>;
```

### Analytics Google

```tsx
<ErrorBoundary
  onError={(error) => {
    gtag('event', 'exception', {
      description: error.message,
      fatal: false,
    });
  }}
>
  <MonComposant />
</ErrorBoundary>
```

## Debugging

En mode développement, les error boundaries affichent :

- Message d'erreur complet
- Stack trace
- Component stack (pour React)
- Détails spécifiques (tRPC, validation, etc.)

Pour tester les error boundaries :

```tsx
// Composant de test pour déclencher des erreurs
function ErrorTrigger() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Erreur de test');
  }

  return <button onClick={() => setShouldError(true)}>Déclencher erreur</button>;
}
```

Cette architecture d'error boundaries garantit une expérience utilisateur robuste même en cas de problèmes inattendus.
