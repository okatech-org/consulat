import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { profileRouter } from './profile';

// Types d'input pour toutes les procédures du router profiles
export type ProfilesRouterInputs = inferRouterInputs<typeof profileRouter>;

// Types d'output pour toutes les procédures du router profiles
export type ProfilesRouterOutputs = inferRouterOutputs<typeof profileRouter>;

// Types spécifiques pour getDashboard
export type ProfileDashboard = ProfilesRouterOutputs['getDashboard'];

// Types pour getCurrentOrganizationContactData
export type CurrentOrganizationContactData =
  ProfilesRouterOutputs['getCurrentOrganizationContactData'];

// Types pour getCurrent
export type CurrentProfile = ProfilesRouterOutputs['getCurrent'];

// Types pour getById
export type GetProfileByIdInput = ProfilesRouterInputs['getById'];
export type ProfileById = ProfilesRouterOutputs['getById'];

// Types pour getByQuery
export type GetProfileByQueryInput = ProfilesRouterInputs['getByQuery'];
export type ProfileByQuery = ProfilesRouterOutputs['getByQuery'];

// Types pour getRegistrationRequest
export type GetRegistrationRequestInput = ProfilesRouterInputs['getRegistrationRequest'];
export type RegistrationRequest = ProfilesRouterOutputs['getRegistrationRequest'];

// Types pour create
export type CreateProfileInput = ProfilesRouterInputs['create'];
export type CreateProfileResult = ProfilesRouterOutputs['create'];

// Types pour update
export type UpdateProfileInput = ProfilesRouterInputs['update'];
export type UpdateProfileResult = ProfilesRouterOutputs['update'];

// Types pour updateSection
export type UpdateProfileSectionInput = ProfilesRouterInputs['updateSection'];
export type UpdateProfileSectionResult = ProfilesRouterOutputs['updateSection'];

// Types pour submit
export type SubmitProfileInput = ProfilesRouterInputs['submit'];
export type SubmitProfileResult = ProfilesRouterOutputs['submit'];

// Types pour getRegistrationService
export type RegistrationService = ProfilesRouterOutputs['getRegistrationService'];

// Types pour getCurrentUser
export type CurrentUser = ProfilesRouterOutputs['getCurrentUser'];

// Types pour updateProfile
export type UpdateUserProfileInput = ProfilesRouterInputs['updateProfile'];
export type UpdateUserProfileResult = ProfilesRouterOutputs['updateProfile'];

// Types pour getByParent
export type GetByParentInput = ProfilesRouterInputs['getByParent'];
export type ProfilesByParent = ProfilesRouterOutputs['getByParent'];

// Types pour getList
export type ProfilesListResult = ProfilesRouterOutputs['getList'];
export type ProfilesListInput = ProfilesRouterInputs['getList'];
export type ProfilesListItem = ProfilesRouterOutputs['getList']['items'][number];

// Types pour sendMessage
export type SendMessageInput = ProfilesRouterInputs['sendMessage'];
export type SendMessageResult = ProfilesRouterOutputs['sendMessage'];

// Types pour createChildProfile
export type CreateChildProfileInput = ProfilesRouterInputs['createChildProfile'];
export type CreateChildProfileResult = ProfilesRouterOutputs['createChildProfile'];

// Types pour deleteChildProfile
export type DeleteChildProfileInput = ProfilesRouterInputs['deleteChildProfile'];
export type DeleteChildProfileResult = ProfilesRouterOutputs['deleteChildProfile'];

// Types pour submitChildProfileForValidation
export type SubmitChildProfileInput =
  ProfilesRouterInputs['submitChildProfileForValidation'];
export type SubmitChildProfileResult =
  ProfilesRouterOutputs['submitChildProfileForValidation'];

// Types pour updateBasicInfo
export type UpdateBasicInfoInput = ProfilesRouterInputs['updateBasicInfo'];
export type UpdateBasicInfoResult = ProfilesRouterOutputs['updateBasicInfo'];

// Types pour updateParentalAuthority
export type UpdateParentalAuthorityInput =
  ProfilesRouterInputs['updateParentalAuthority'];
export type UpdateParentalAuthorityResult =
  ProfilesRouterOutputs['updateParentalAuthority'];

// Types pour getChildProfileStats
export type GetChildProfileStatsInput = ProfilesRouterInputs['getChildProfileStats'];
export type ChildProfileStats = ProfilesRouterOutputs['getChildProfileStats'];

// Types pour getChildrenForDashboard
export type GetChildrenForDashboardInput =
  ProfilesRouterInputs['getChildrenForDashboard'];
export type ChildrenForDashboard = ProfilesRouterOutputs['getChildrenForDashboard'];

// Types exportés depuis le router (compatibility)
export type FullProfile = ProfilesRouterOutputs['getCurrent'];
export type RegistrationRequestType = ProfilesRouterOutputs['getRegistrationRequest'];
