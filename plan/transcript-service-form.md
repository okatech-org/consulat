# Plan d'implémentation du formulaire de transcription

## 1. Structure du service

- [ ] Créer un nouveau type de service spécialisé pour la transcription dans la catégorie TRANSCRIPT
- [ ] Définir les étapes du processus de transcription :
  1. Informations sur le document à transcrire
  2. Informations sur le demandeur
  3. Documents requis
  4. Rendez-vous (si nécessaire)

## 2. Champs du formulaire de transcription

### 2.1 Informations sur le document

- [ ] Type de document à transcrire (acte de naissance, mariage, décès)
- [ ] Date du document original
- [ ] Pays d'émission
- [ ] Autorité émettrice
- [ ] Langue du document original

### 2.2 Informations sur le demandeur

- [ ] Nom complet (lié au profil)
- [ ] Date de naissance (lié au profil)
- [ ] Lieu de naissance (lié au profil)
- [ ] Nationalité (lié au profil)
- [ ] Lien avec la personne concernée par l'acte
- [ ] Adresse actuelle (lié au profil)
- [ ] Coordonnées de contact (lié au profil)

### 2.3 Documents requis

- [ ] Document original à transcrire
- [ ] Traduction assermentée (si document non francophone)
- [ ] Justificatif de nationalité française
- [ ] Pièce d'identité
- [ ] Justificatif de domicile (lié au profil)
- [ ] Livret de famille (si applicable)

## 3. Implémentation technique

- [ ] Créer un composant `TranscriptServiceForm` spécialisé
- [ ] Implémenter la logique de liaison avec le profil consulaire
- [ ] Ajouter la validation des champs avec Zod
- [ ] Gérer l'upload des documents requis
- [ ] Implémenter la logique de sauvegarde des données

## 4. Intégration UI/UX

- [ ] Créer une interface intuitive pour la sélection du type de transcription
- [ ] Ajouter des indicateurs visuels pour les champs liés au profil
- [ ] Implémenter des tooltips explicatifs
- [ ] Ajouter des messages d'aide contextuels
- [ ] Assurer la compatibilité mobile

## 5. Validation et sécurité

- [ ] Implémenter la validation des données côté serveur
- [ ] Ajouter des vérifications de sécurité pour l'accès aux données du profil
- [ ] Gérer les cas d'erreur et les messages appropriés
- [ ] Mettre en place la journalisation des actions

## 6. Tests et documentation

- [ ] Tester tous les scénarios de transcription
- [ ] Documenter les règles métier
- [ ] Ajouter des commentaires explicatifs dans le code
- [ ] Mettre à jour la documentation utilisateur
