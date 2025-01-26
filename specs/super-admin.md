# Spécifications Fonctionnelles - Super Administrateur

## 1. Gestion des Pays

### Fonctionnalités Principales

- [x] Création et configuration des pays
- [x] Visualisation de la liste des pays
- [x] Modification des informations des pays
- [x] Désactivation/Activation des pays
- [ ] Consultation des statistiques par pays

### Données Gérées

- [x] Nom du pays
- [x] Code du pays
- [x] Statut (actif/inactif)
- [x] Paramètres régionaux (devise, langue, format de date/heure, fuseau horaire, ordre des champs d'adresse, champs
  obligatoires d'adresse, jours fériés)

## 2. Gestion des Organismes

### Fonctionnalités Principales

- [x] Création d'organismes (consulats, ambassades)
- [x] Attribution des organismes aux pays
- [x] Configuration des paramètres des organismes (nom, logo, type, statut, pays)
- [x] Supervision des organismes
- [x] Gestion des accès et permissions *(Via la gestion des utilisateurs et l'attribution de rôles)*
- [ ] Gestion des services liés aux organismes (Ajout, suppression, affichage) *En cours*

### Données Gérées

- [x] Nom de l'organisme
- [x] Logo
- [x] Type d'organisme (ambassade, consulat, etc.)
- [x] Statut opérationnel (actif, inactif, suspendu)
- [x] Pays de rattachement (plusieurs possibles)
- [x] Informations de contact *(Dans les métadonnées : adresse, email, téléphone, site web)*
- [ ] Jours fériés et fermetures exceptionnelles *(Reporté)*
- [ ] Horaires d'ouverture *(Reporté)*

## 3. Gestion des Services

### Fonctionnalités Principales

- [x] Définition des services disponibles
- [x] Attribution des services aux organismes
- [x] Configuration des workflows de services *(Via les étapes du service)*
- [x] Paramétrage des documents requis
- [x] Gestion des tarifs
- [ ] Affichage de la liste des services liés à un organisme dans les paramètres de l'organisme *En cours*

### Données Gérées

- [x] Nom du service
- [x] Description
- [x] Documents requis
- [x] Délais de traitement *(Non implémenté explicitement, mais potentiellement géré par les rendez-vous)*
- [x] Coûts et tarifs

## 4. Gestion des Utilisateurs

### Fonctionnalités Principales

- [ ] Supervision des comptes utilisateurs *(Partiellement via les profils, mais pas de tableau de bord dédié)*
- [x] Gestion des rôles et permissions
- [ ] Validation des comptes spéciaux *(Non implémenté)*
- [ ] Surveillance des activités *(Non implémenté)*

### Types d'Utilisateurs Gérés

- [x] Managers d'organismes
- [x] Utilisateurs standards
- [x] Administrateurs locaux

## 5. Supervision des Demandes

### Fonctionnalités Principales

- [ ] Vue globale des demandes *(Non implémenté)*
- [ ] Suivi des performances *(Non implémenté)*
- [ ] Gestion des escalades *(Non implémenté)*
- [ ] Rapports d'activité *(Non implémenté)*

### Données Surveillées

- [ ] Statuts des demandes
- [ ] Temps de traitement
- [ ] Performance des managers
- [ ] Satisfaction utilisateur

## 6. Tableau de Bord

### Fonctionnalités Principales

- [ ] Statistiques globales *(Non implémenté)*
- [ ] Indicateurs de performance *(Non implémenté)*
- [ ] Alertes et notifications *(Non implémenté)*
- [ ] Rapports personnalisables *(Non implémenté)*

### Métriques Clés

- [ ] Nombre d'utilisateurs actifs
- [ ] Volume de demandes
- [ ] Taux de résolution
- [ ] Performance par pays/organisme

## 7. Configuration Système

### Fonctionnalités Principales

- [x] Paramètres globaux *(Variables d'environnement, fichiers de configuration)*
- [ ] Gestion des templates *(Non implémenté)*
- [x] Configuration des workflows *(Implémenté partiellement via la structure du code et les schémas)*
- [x] Paramètres de sécurité *(Headers de sécurité, etc.)*

### Éléments Configurables

- [ ] Paramètres de notification
- [ ] Templates de documents
- [x] Règles de validation *(Via Zod)*
- [x] Politiques de sécurité

## 8. Gestion des Profils

### Fonctionnalités Principales

- [x] Validation des profils spéciaux *(Via le statut du profil et les notes)*
- [ ] Gestion des informations sensibles *(Non spécifié)*
- [x] Supervision des modifications *(Via l'historique des mises à jour et les logs)*
- [ ] Historique des changements *(Non implémenté explicitement, mais potentiellement géré par Prisma)*

### Données Gérées

- [x] Informations personnelles
- [x] Documents officiels
- [x] Historique des modifications *(Via Prisma)*
- [x] Statuts de validation