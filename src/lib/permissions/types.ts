import {
  User,
  Profile,
  Appointment,
  ServiceRequest,
  Organization,
  ConsularService,
  UserDocument,
  UserRole,
} from '@prisma/client';

export type ResourceType = {
  profiles: {
    dataType: Profile;
    action: 'view' | 'create' | 'update' | 'delete' | 'validate';
  };
  appointments: {
    dataType: Appointment;
    action: 'view' | 'create' | 'update' | 'delete' | 'reschedule' | 'cancel';
  };
  serviceRequests: {
    dataType: ServiceRequest;
    action: 'view' | 'create' | 'update' | 'delete' | 'process' | 'validate' | 'list';
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
