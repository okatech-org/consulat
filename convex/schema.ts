import { defineSchema } from 'convex/server';

import { users } from './tables/users';
import { profiles } from './tables/profiles';
import { organizations } from './tables/organizations';
import { memberships } from './tables/memberships';
import { services } from './tables/services';
import { requests } from './tables/requests';
import { documents } from './tables/documents';
import { appointments } from './tables/appointments';
import { notifications } from './tables/notifications';
import { countries } from './tables/countries';
import { tickets } from './tables/tickets';
import { childProfiles } from './tables/childProfiles';
import { intelligenceNotes, intelligenceNoteHistory } from './tables/intelligenceNotes';
import { associations, associationMembers } from './tables/associations';

export default defineSchema({
  users,
  profiles,
  organizations,
  memberships,
  services,
  requests,
  documents,
  appointments,
  notifications,
  countries,
  tickets,
  childProfiles,
  intelligenceNotes,
  intelligenceNoteHistory,
  associations,
  associationMembers,
});
