# Identifiants des Utilisateurs de Test

Ce document liste les différents utilisateurs créés par le script seed.ts pour faciliter les tests et le développement.

## Super Administrateurs

| Email | Nom | Prénom | Rôle | Pays |
|-------|-----|--------|------|------|
| itoutouberny+sa@gmail.com | Admin | Super | SUPER_ADMIN | France |

## Administrateurs

| Email | Nom | Prénom | Rôle | Pays | Organisation |
|-------|-----|--------|------|------|-------------|
| itoutouberny+ad@gmail.com | 1 | Admin | ADMIN | France | Ambassade du Gabon en France |

## Agents Consulaires

| Email | Nom | Prénom | Rôle | Pays | Organisation | Spécialisations |
|-------|-----|--------|------|------|-------------|----------------|
| agent1@consulat.ga | 1 | Agent | AGENT | France | Ambassade du Gabon en France | IDENTITY, CIVIL_STATUS, REGISTRATION, CERTIFICATION, OTHER, VISA |
| agent2@consulat.ga | 2 | Agent | AGENT | France | Consulat Général du Gabon à Marseille | IDENTITY, CIVIL_STATUS, REGISTRATION, CERTIFICATION, OTHER, VISA |
| agent3@consulat.ga | 3 | Agent | AGENT | États-Unis | Ambassade du Gabon aux États-Unis | IDENTITY, CIVIL_STATUS, VISA |

## Utilisateurs Réguliers

### Berny Itoutou (France)

| Email | Nom | Prénom | Rôle | Pays |
|-------|-----|--------|------|------|
| itoutouberny@gmail.com | Itoutou | Berny | USER | France |

**Informations supplémentaires:**
- Date de naissance: 01/01/1990
- Lieu de naissance: Paris
- Nationalité: Gabonaise
- Numéro de passeport: GA123456
- État civil: Célibataire
- Profession: Développeur
- Adresse: 123 Rue de la Paix, Appartement 4B, 75008 Paris
- Téléphone: +33 612345678

### Sarah Smith (États-Unis)

| Email | Nom | Prénom | Rôle | Pays |
|-------|-----|--------|------|------|
| sarah.smith@example.com | Smith | Sarah | USER | États-Unis |

**Informations supplémentaires:**
- Date de naissance: 15/05/1988
- Lieu de naissance: New York
- Nationalité: Gabonaise
- Numéro de passeport: GA789012
- État civil: Mariée
- Profession: Médecin
- Adresse: 350 5th Avenue, Apt 789, New York, 10118
- Téléphone: +1 2125550199

### Jean Dupont (Canada)

| Email | Nom | Prénom | Rôle | Pays |
|-------|-----|--------|------|------|
| jean.dupont@example.com | Dupont | Jean | USER | Canada |

**Informations supplémentaires:**
- Date de naissance: 20/09/1995
- Lieu de naissance: Montreal
- Nationalité: Gabonaise
- Numéro de passeport: GA456789
- État civil: Célibataire
- Profession: Étudiant
- Adresse: 1234 Rue Sainte-Catherine, App 567, Montréal, H3H 2R9
- Téléphone: +1 5145550123

## Services Consulaires

| ID | Nom | Catégorie | Organisation | Prix |
|----|-----|-----------|-------------|------|
| service-passport | Demande de passeport | IDENTITY | Ambassade du Gabon en France | 50 EUR |
| service-registration | Inscription consulaire | REGISTRATION | Ambassade du Gabon en France | Gratuit |

## Rendez-vous

| ID | Utilisateur | Date | Heure | Type | Organisation |
|----|------------|------|-------|------|-------------|
| appointment-berny-itoutou-1 | Berny Itoutou | 15/04/2024 | 09:00-09:30 | DOCUMENT_SUBMISSION | Ambassade du Gabon en France |
| appointment-berny-itoutou-2 | Berny Itoutou | 16/04/2024 | 14:00-14:45 | DOCUMENT_COLLECTION | Consulat Général du Gabon à Marseille |
| appointment-sarah-smith-1 | Sarah Smith | 20/04/2024 | 14:00-14:30 | DOCUMENT_SUBMISSION | Consulat du Gabon à New York |
| appointment-sarah-smith-2 | Sarah Smith | 25/04/2024 | 15:00-15:45 | INTERVIEW | Consulat du Gabon à New York |
| appointment-jean-dupont-1 | Jean Dupont | 22/04/2024 | 13:00-13:30 | DOCUMENT_COLLECTION | Ambassade du Gabon au Canada | 