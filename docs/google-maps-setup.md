# Configuration Google Maps

## Clé API requise

Pour utiliser la carte Google Maps dans le dashboard admin, vous devez configurer la variable d'environnement :

```bash
NEXT_PUBLIC_GEMINI_API_KEY=votre_cle_api_google
```

**Note** : La clé `GEMINI_API_KEY` donne accès à toutes les APIs Google, donc on utilise la même clé côté client.

## Fonctionnalités implémentées

### ✅ Nouvelle implémentation Google Maps
- **Composant** : `GoogleMapsDashboard` 
- **Géocodage automatique** : Les adresses sont directement géocodées par Google Maps
- **Marqueurs colorés** : Couleur selon la concentration de profils
- **InfoWindow** : Popup avec détails au clic sur un marqueur
- **Centrage automatique** : La carte s'ajuste automatiquement aux données
- **Statistiques** : Nombre de villes, profils totaux, villes internationales

### 🔄 Améliorations par rapport à Leaflet
- **Plus rapide** : Pas de géocodage côté serveur
- **Plus précis** : Google Maps gère mieux les adresses
- **Plus fiable** : Moins d'erreurs de timeout
- **Plus simple** : Moins de code à maintenir

### 📊 Données affichées
- **Normalisation** : Les noms de villes sont normalisés (ex: "BORDEAUX" → "Bordeaux")
- **Groupement** : Les profils sont groupés par ville
- **Filtrage** : Les entrées invalides sont filtrées
- **Correction** : Les pays sont automatiquement corrigés

## Structure des données

```typescript
interface ProfileLocation {
  id: string;
  address: string;      // Adresse complète pour Google Maps
  city: string;         // Ville normalisée
  country: string;      // Pays normalisé
  count: number;        // Nombre de profils
}
```

## Anciens composants supprimés

- `world-map.tsx` (Leaflet)
- `world-map-wrapper.tsx` (Leaflet SSR)
- `world-map-svg.tsx` (SVG statique)
- Dépendances : `react-leaflet`, `leaflet`, `@types/leaflet` 