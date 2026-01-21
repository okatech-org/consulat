# Guide d'Accessibilité et d'Autocomplétion des Formulaires

Ce guide explique comment utiliser les composants `Field` avec les attributs d'accessibilité et d'autocomplétion appropriés.

## Principes généraux

### 1. Labels obligatoires
Chaque champ de formulaire doit avoir un `<FieldLabel>` visible associé au champ via l'attribut `htmlFor` (géré automatiquement par le composant `Field`).

### 2. Attributs ARIA
- `aria-describedby` : Lié automatiquement aux descriptions et erreurs
- `aria-invalid` : Défini automatiquement selon l'état du champ
- `aria-required` : Défini automatiquement pour les champs obligatoires
- `aria-live="polite"` : Ajouté aux messages d'erreur

### 3. Autocomplétion
Utilisez les fonctions utilitaires de `/src/lib/form/autocomplete.ts` pour générer les valeurs `autocomplete` appropriées selon le contexte.

## Utilisation des composants Field

### Exemple basique

```tsx
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getAutocompleteForField } from '@/lib/form/autocomplete';

<Field name="email" control={form.control}>
  <FieldLabel>Email</FieldLabel>
  <Input
    {...form.register('email')}
    type="email"
    autoComplete={getAutocompleteForField('email')}
  />
  <FieldDescription>Nous ne partagerons jamais votre email</FieldDescription>
  <FieldError />
</Field>
```

### Champs avec sections (contacts d'urgence)

Pour distinguer les contacts d'urgence, utilisez `getEmergencyContactAutocomplete` :

```tsx
import { getEmergencyContactAutocomplete } from '@/lib/form/autocomplete';

{emergencyContactFields.map((field, index) => (
  <Field name={`emergencyContacts.${index}.firstName`} control={form.control}>
    <FieldLabel>Prénom</FieldLabel>
    <Input
      {...form.register(`emergencyContacts.${index}.firstName`)}
      autoComplete={getEmergencyContactAutocomplete('firstName', index as 0 | 1)}
    />
    <FieldError />
  </Field>
))}
```

Cela génère :
- Contact 1 : `section-emergency-contact-1 given-name`
- Contact 2 : `section-emergency-contact-2 given-name`

### Champs d'adresse

Pour les adresses, utilisez `getAddressAutocomplete` :

```tsx
import { getAddressAutocomplete } from '@/lib/form/autocomplete';

<Field name="address.street" control={form.control}>
  <FieldLabel>Rue</FieldLabel>
  <Input
    {...form.register('address.street')}
    autoComplete={getAddressAutocomplete('street')}
  />
  <FieldError />
</Field>
```

## Mapping des champs courants

| Nom du champ | Valeur autocomplete |
|--------------|---------------------|
| `firstName` | `given-name` |
| `lastName` | `family-name` |
| `email` | `email` |
| `phone` / `phoneNumber` | `tel` |
| `street` | `street-address` |
| `city` | `address-level2` |
| `postalCode` | `postal-code` |
| `country` | `country-name` |
| `birthDate` | `bday` |
| `password` | `new-password` |
| `documentNumber` | `off` (données sensibles) |

## Sections disponibles

Les sections permettent de distinguer les champs répétés :

- `section-emergency-contact-1` : Premier contact d'urgence
- `section-emergency-contact-2` : Deuxième contact d'urgence
- `section-spouse` : Informations du conjoint
- `section-employer` : Informations de l'employeur
- `section-parent-1` : Premier parent
- `section-parent-2` : Deuxième parent

## Exemple complet : Formulaire de contact avec contacts d'urgence

```tsx
import { Field, FieldLabel, FieldError, FieldSet, FieldLegend, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { getAutocompleteForField, getEmergencyContactAutocomplete } from '@/lib/form/autocomplete';

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    {/* Email principal */}
    <Field name="email" control={form.control}>
      <FieldLabel>Email</FieldLabel>
      <Input
        {...form.register('email')}
        type="email"
        autoComplete={getAutocompleteForField('email')}
      />
      <FieldError />
    </Field>

    {/* Téléphone principal */}
    <Field name="phone" control={form.control}>
      <FieldLabel>Téléphone</FieldLabel>
      <PhoneInput
        value={form.watch('phone')}
        onChange={(val) => form.setValue('phone', val)}
        autoComplete={getAutocompleteForField('phone')}
      />
      <FieldError />
    </Field>

    {/* Contacts d'urgence */}
    <FieldSet>
      <FieldLegend>Contacts d'urgence</FieldLegend>
      <FieldDescription>
        Veuillez renseigner deux contacts d'urgence
      </FieldDescription>

      {emergencyContactFields.map((field, index) => (
        <div key={field.id}>
          <h4>
            {index === 0 ? 'Contact au Gabon' : 'Contact pays de résidence'}
          </h4>

          {/* Prénom avec section appropriée */}
          <Field name={`emergencyContacts.${index}.firstName`} control={form.control}>
            <FieldLabel>Prénom</FieldLabel>
            <Input
              {...form.register(`emergencyContacts.${index}.firstName`)}
              autoComplete={getEmergencyContactAutocomplete('firstName', index as 0 | 1)}
            />
            <FieldError />
          </Field>

          {/* Email avec section et type de contact */}
          <Field name={`emergencyContacts.${index}.email`} control={form.control}>
            <FieldLabel>Email</FieldLabel>
            <Input
              {...form.register(`emergencyContacts.${index}.email`)}
              type="email"
              autoComplete={getEmergencyContactAutocomplete('email', index as 0 | 1)}
            />
            <FieldError />
          </Field>
        </div>
      ))}
    </FieldSet>
  </form>
</Form>
```

## Bonnes pratiques

1. **Toujours utiliser `Field` avec `name` et `control`** : Cela active automatiquement la gestion des IDs, aria-describedby, etc.

2. **Utiliser les fonctions utilitaires** : Ne pas hardcoder les valeurs `autocomplete`, utiliser les fonctions de `/src/lib/form/autocomplete.ts`

3. **Sections pour les champs répétés** : Toujours utiliser des sections distinctes pour les champs répétés (contacts d'urgence, parents, etc.)

4. **Labels descriptifs** : Les labels doivent être clairs et descriptifs

5. **Descriptions utiles** : Utiliser `FieldDescription` pour fournir des informations supplémentaires

6. **Gestion des erreurs** : Toujours inclure `<FieldError />` pour afficher les erreurs de validation

## Tests d'accessibilité

Pour tester l'accessibilité de vos formulaires :

1. **Lecteurs d'écran** : Tester avec NVDA (Windows) ou VoiceOver (Mac)
2. **Navigation au clavier** : Vérifier que tous les champs sont accessibles via Tab
3. **Outils automatiques** : Utiliser axe DevTools, Lighthouse, ou WAVE

## Références

- [MDN - Autocomplete attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete)
- [A11y Project - Accessible Forms](https://www.a11y-project.com/posts/how-to-write-accessible-forms/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
