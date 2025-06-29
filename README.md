# Consulat.ga - Plateforme Numérique Consulaire

Une plateforme moderne et sécurisée pour la gestion des services consulaires, permettant aux citoyens d'accéder facilement aux services administratifs et aux agents consulaires de gérer efficacement les demandes et rendez-vous.

## 🚀 Fonctionnalités Principales

### Pour les Citoyens

- **Inscription consulaire** en ligne avec validation intelligente
- **Prise de rendez-vous** automatisée avec système de créneaux
- **Suivi des demandes** en temps réel avec notifications
- **Gestion des documents** personnels et familiaux
- **Services consulaires** numériques (attestations, légalisations, etc.)
- **Chat intelligent** pour assistance et orientation

### Pour les Agents Consulaires

- **Dashboard de gestion** avec vue d'ensemble des activités
- **Validation des profils** avec outils d'analyse IA
- **Planification des rendez-vous** avec gestion des créneaux
- **Génération de documents** automatisée
- **Système de notifications** multichannel (Email, SMS, Push)
- **Rapports et statistiques** avancés

### Administration

- **Gestion multi-organisationnelle** avec rôles hiérarchiques
- **Configuration des services** par pays/consulat
- **Tableaux de bord analytiques** en temps réel
- **Système de feedback** et amélioration continue
- **Audit de sécurité** et traçabilité complète

## 🛠️ Technologies Utilisées

Cette application est construite avec un stack moderne et performant :

- **[Next.js 14](https://nextjs.org)** - Framework React avec App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique pour une meilleure robustesse
- **[Prisma](https://prisma.io)** - ORM moderne pour la gestion de base de données
- **[NextAuth.js](https://next-auth.js.org)** - Authentification sécurisée
- **[Tailwind CSS](https://tailwindcss.com)** - Framework CSS utilitaire
- **[Shadcn/ui](https://ui.shadcn.com/)** - Composants UI modernes et accessibles
- **[Radix UI](https://www.radix-ui.com/)** - Primitives UI accessibles
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** - Gestion et validation des formulaires
- **[next-intl](https://next-intl-docs.vercel.app/)** - Internationalisation complète
- **[Zustand](https://github.com/pmndrs/zustand)** - Gestion d'état légère
- **[Google Gemini AI](https://ai.google.dev/)** - Intelligence artificielle pour l'analyse de profils

## 🚦 Prérequis

- **Node.js** 18.17 ou version supérieure
- **Bun** (gestionnaire de paquets recommandé)
- **Base de données** PostgreSQL ou compatible
- **Variables d'environnement** configurées (voir `.env.example`)

## 📦 Installation

1. **Cloner le repository**

```bash
git clone https://github.com/votre-org/consulat.ga.git
cd consulat.ga
```

2. **Installer les dépendances**

```bash
bun install
```

3. **Configurer l'environnement**

```bash
cp .env.example .env.local
# Éditer .env.local avec vos configurations
```

4. **Configurer la base de données**

```bash
bunx prisma migrate dev
bunx prisma db seed  # Si des données de test sont disponibles
```

5. **Lancer l'application en développement**

```bash
bun dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🔧 Scripts Disponibles

```bash
# Développement
bun dev          # Démarrer en mode développement
bun build        # Construire pour la production
bun start        # Démarrer en mode production
bun lint         # Linter le code
bun type-check   # Vérification TypeScript

# Base de données
bunx prisma studio              # Interface graphique Prisma
bunx prisma migrate dev         # Appliquer les migrations
bunx prisma generate           # Générer le client Prisma
bunx prisma db push           # Synchroniser le schéma

# Maintenance
bun run db:backup             # Sauvegarder la base de données
bun run security:audit        # Audit de sécurité
```

## 📁 Structure du Projet

```
src/
├── app/                    # Pages Next.js App Router
│   ├── (authenticated)/    # Routes authentifiées
│   ├── (public)/          # Routes publiques
│   └── api/               # API Routes
├── components/            # Composants React réutilisables
│   ├── ui/               # Composants UI de base (Shadcn)
│   └── [feature]/        # Composants par fonctionnalité
├── actions/              # Server Actions Next.js
├── hooks/                # Hooks React personnalisés
├── lib/                  # Utilitaires et configurations
├── schemas/              # Schémas de validation Zod
├── types/                # Définitions TypeScript
└── i18n/                 # Fichiers de traduction
```

## 🌍 Internationalisation

Le projet supporte actuellement :

- **Français** (langue principale)
- Architecture prête pour l'ajout d'autres langues

## 🔒 Sécurité

- **Chiffrement** des données sensibles
- **Validation** stricte côté serveur et client
- **Audit logs** pour toutes les actions critiques
- **Rate limiting** sur les API sensibles
- **CSP** et headers de sécurité configurés

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
bunx vercel --prod
```

### Docker

```bash
docker build -t consulat-ga .
docker run -p 3000:3000 consulat-ga
```

## 📊 Monitoring et Analytics

- **Logs structurés** avec rotation automatique
- **Métriques de performance** intégrées
- **Alertes automatiques** pour les erreurs critiques
- **Dashboard de monitoring** pour les administrateurs

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou support technique, contactez l'équipe de développement ou consultez la documentation complète dans le dossier `/docs`.
