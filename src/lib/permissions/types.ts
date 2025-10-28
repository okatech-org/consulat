import type { Doc } from '@/convex/_generated/dataModel';
import type { UserRole } from '@/convex/lib/constants';

export type ResourceType = {
  profiles: {
    dataType: Doc<'profiles'>;
    action:
      | 'view'
      | 'create'
      | 'update'
      | 'delete'
      | 'validate'
      | 'viewChild'
      | 'createChild'
      | 'updateChild'
      | 'deleteChild';
  };
  appointments: {
    dataType: Doc<'appointments'>;
    action: 'view' | 'create' | 'update' | 'delete' | 'reschedule' | 'cancel';
  };
  serviceRequests: {
    dataType: Doc<'requests'>;
    action:
      | 'view'
      | 'create'
      | 'update'
      | 'delete'
      | 'process'
      | 'validate'
      | 'list'
      | 'complete';
  };
  organizations: {
    dataType: Doc<'organizations'>;
    action: 'view' | 'create' | 'update' | 'delete' | 'manage';
  };
  consularServices: {
    dataType: Doc<'services'>;
    action: 'view' | 'create' | 'update' | 'delete' | 'configure';
  };
  documents: {
    dataType: Doc<'documents'>;
    action: 'view' | 'create' | 'update' | 'delete' | 'validate';
  };
  users: {
    dataType: Doc<'users'>;
    action: 'view' | 'create' | 'update' | 'delete' | 'manage';
  };
  childProfiles: {
    dataType: Doc<'childProfiles'>;
    action: 'view' | 'create' | 'update' | 'delete' | 'manage';
  };
  intelligenceNotes: {
    dataType: Doc<'intelligenceNotes'>;
    action: 'view' | 'create' | 'update' | 'delete' | 'viewHistory';
  };
};

export type PermissionCheck<Key extends keyof ResourceType> =
  | boolean
  | ((user: Doc<'users'>, data: ResourceType[Key]['dataType']) => boolean);

export type RolePermissions = {
  [Key in keyof ResourceType]?: {
    [Action in ResourceType[Key]['action']]?: PermissionCheck<Key>;
  };
};

export type RolesConfig = {
  [R in UserRole]: RolePermissions;
};
