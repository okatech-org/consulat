import {
  type User,
  type Profile,
  type Appointment,
  type ServiceRequest,
  type Organization,
  type ConsularService,
  type UserDocument,
  UserRole,
  type ParentalAuthority,
  type IntelligenceNote,
} from '@prisma/client';

export type ResourceType = {
  profiles: {
    dataType: Profile;
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
    dataType: Appointment;
    action: 'view' | 'create' | 'update' | 'delete' | 'reschedule' | 'cancel';
  };
  serviceRequests: {
    dataType: ServiceRequest;
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
    dataType: Organization;
    action: 'view' | 'create' | 'update' | 'delete' | 'manage';
  };
  consularServices: {
    dataType: ConsularService;
    action: 'view' | 'create' | 'update' | 'delete' | 'configure';
  };
  documents: {
    dataType: UserDocument;
    action: 'view' | 'create' | 'update' | 'delete' | 'validate';
  };
  users: {
    dataType: User;
    action: 'view' | 'create' | 'update' | 'delete' | 'manage';
  };
  parentalAuthorities: {
    dataType: ParentalAuthority & {
      profile?: Profile;
      parentUsers?: User[];
    };
    action: 'view' | 'create' | 'update' | 'delete' | 'manage';
  };
  intelligenceNotes: {
    dataType: IntelligenceNote;
    action: 'view' | 'create' | 'update' | 'delete' | 'viewHistory';
  };
};

export type PermissionCheck<Key extends keyof ResourceType> =
  | boolean
  | ((user: User, data: ResourceType[Key]['dataType']) => boolean);

export type RolePermissions = {
  [Key in keyof ResourceType]?: {
    [Action in ResourceType[Key]['action']]?: PermissionCheck<Key>;
  };
};

export type RolesConfig = {
  [R in UserRole]: RolePermissions;
};
