# Refactor: Appointment Creation via ServiceRequest Selection

## 1. Préparation & Analyse

- [x] Lister les ServiceRequests éligibles à la prise de rendez-vous pour l'utilisateur connecté (statuts, agent assigné, etc.)

  - Utilisation de la fonction existante `getServiceRequestsByUser(userId)` dans `src/actions/service-requests.ts`.
  - Cette fonction retourne des objets `FullServiceRequest` incluant : service, agent assigné (`assignedTo`), statut, organisation, documents, notes, messages, rendez-vous déjà existant, etc.
  - Les champs nécessaires pour l'affichage sont donc déjà inclus :
    - Service (nom, catégorie, description...)
    - Statut de la demande
    - Agent assigné (nom, email, spécialités...)
    - Rendez-vous déjà existant (empêcher la double prise de RDV)

- [x] Déterminer les champs nécessaires à afficher (service, statut, agent, etc.)
  - Par défaut :
    - Nom du service
    - Statut de la demande
    - Nom de l'agent assigné (si présent)
    - Résumé de la demande (optionnel)

## 2. Mise à jour du formulaire de rendez-vous

- [x] Remplacer la sélection de service par une sélection de ServiceRequest (demande)
  - Le formulaire affichera désormais une liste des demandes (ServiceRequests) éligibles, avec nom du service, statut, agent assigné, etc.
  - L'utilisateur choisira la demande pour laquelle il souhaite prendre rendez-vous.
- [x] Afficher les informations de la demande sélectionnée (service, statut, agent assigné)
  - Les informations du service, du statut et de l'agent assigné (si présent) sont affichées dans le formulaire.
- [ ] Si agent assigné, afficher son nom et utiliser son planning pour les créneaux
  - Prochaine étape :
    - Afficher le nom de l'agent assigné dans le résumé de la demande sélectionnée.
    - Si un agent est assigné, adapter la récupération des créneaux pour n'afficher que ceux de cet agent (sinon, fallback sur la logique actuelle).

## 3. Logique de récupération des créneaux

- [x] Si agent assigné, ne proposer que ses créneaux disponibles
  - Filtrage des créneaux par agent assigné : seuls les créneaux où l'agent assigné est disponible sont proposés
- [x] Si pas d'agent assigné, utiliser la logique actuelle (tous agents de la catégorie)
  - Fallback vers tous les agents disponibles si aucun agent n'est assigné à la demande

## 4. Mise à jour du processus de création

- [x] Lors de la création du rendez-vous, utiliser l'ID du service de la demande sélectionnée
  - Le formulaire définit maintenant à la fois `requestId` (ID de la demande) et `serviceId` (ID du service de la demande)
  - La création de rendez-vous lie correctement le rendez-vous à la fois au service et à la demande
- [x] Associer le rendez-vous à la demande sélectionnée (requestId)
  - Le rendez-vous est désormais associé à la ServiceRequest via le champ `requestId`

## 5. UI/UX & Traductions

- [ ] Mettre à jour les labels, descriptions et traductions pour refléter le nouveau flux
- [ ] S'assurer que le formulaire reste multi-étapes et mobile-friendly

## 6. Validation & Sécurité

- [ ] Vérifier l'éligibilité des demandes (statut, pas déjà de rendez-vous, etc.)
- [ ] Gérer les erreurs et cas limites (pas d'agent, pas de créneau, etc.)

## 7. Tests & Documentation

- [ ] Mettre à jour/ajouter des tests pour la nouvelle logique
- [ ] Documenter le nouveau flux dans le README ou la doc interne

---

**Priorité mobile :**

- Adapter l'affichage des listes et sélecteurs pour une expérience optimale sur mobile.
- Vérifier la compatibilité responsive sur toutes les étapes.

**Composants à créer/modifier :**

- `src/components/appointments/new-appointment-form.tsx`
- `src/actions/appointments.ts` (ou équivalent pour la logique de créneaux)
- `src/components/ui/multi-select.tsx` (si besoin d'adapter le sélecteur)
- Traductions dans `src/i18n/messages/fr/index.ts`

---

**Après validation de ce plan, chaque étape sera cochée et expliquée lors de l'implémentation.**
