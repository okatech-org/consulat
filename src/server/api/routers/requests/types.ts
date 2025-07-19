import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { requestsRouter } from './index';

// Types d'input pour toutes les procédures du router requests
export type RequestsRouterInputs = inferRouterInputs<typeof requestsRouter>;

// Types d'output pour toutes les procédures du router requests
export type RequestsRouterOutputs = inferRouterOutputs<typeof requestsRouter>;

// Types spécifiques pour getList
export type RequestListQueryInput = RequestsRouterInputs['getList'];
export type RequestListQueryResult = RequestsRouterOutputs['getList'];
export type RequestListItem = RequestsRouterOutputs['getList']['items'][number];

// Types pour getById
export type GetRequestByIdInput = RequestsRouterInputs['getById'];
export type RequestDetails = RequestsRouterOutputs['getById'];

// Types pour getByUser
export type GetRequestsByUserInput = RequestsRouterInputs['getByUser'];
export type UserRequests = RequestsRouterOutputs['getByUser'];

// Types pour assign
export type AssignRequestInput = RequestsRouterInputs['assign'];
export type AssignRequestResult = RequestsRouterOutputs['assign'];

// Types pour reassign
export type ReassignRequestInput = RequestsRouterInputs['reassign'];
export type ReassignRequestResult = RequestsRouterOutputs['reassign'];

// Types pour updateStatus
export type UpdateRequestStatusInput = RequestsRouterInputs['updateStatus'];
export type UpdateRequestStatusResult = RequestsRouterOutputs['updateStatus'];

// Types pour update
export type UpdateRequestInput = RequestsRouterInputs['update'];
export type UpdateRequestResult = RequestsRouterOutputs['update'];

// Types pour validateConsularRegistration
export type ValidateConsularRegistrationInput =
  RequestsRouterInputs['validateConsularRegistration'];
export type ValidateConsularRegistrationResult =
  RequestsRouterOutputs['validateConsularRegistration'];

// Types pour updateConsularStatus
export type UpdateConsularStatusInput = RequestsRouterInputs['updateConsularStatus'];
export type UpdateConsularStatusResult = RequestsRouterOutputs['updateConsularStatus'];

// Types pour startCardProduction
export type StartCardProductionInput = RequestsRouterInputs['startCardProduction'];
export type StartCardProductionResult = RequestsRouterOutputs['startCardProduction'];

// Types pour validateRegistration
export type ValidateRegistrationInput = RequestsRouterInputs['validateRegistration'];
export type ValidateRegistrationResult = RequestsRouterOutputs['validateRegistration'];

// Types pour getActionHistory
export type GetActionHistoryInput = RequestsRouterInputs['getActionHistory'];
export type ActionHistory = RequestsRouterOutputs['getActionHistory'];

// Types pour getNotes
export type GetNotesInput = RequestsRouterInputs['getNotes'];
export type RequestNotes = RequestsRouterOutputs['getNotes'];

// Types pour addNote
export type AddNoteInput = RequestsRouterInputs['addNote'];
export type AddNoteResult = RequestsRouterOutputs['addNote'];

// Types pour getStatusStats
export type GetStatusStatsInput = RequestsRouterInputs['getStatusStats'];
export type StatusStats = RequestsRouterOutputs['getStatusStats'];

// Types pour getCurrent
export type CurrentRequest = RequestsRouterOutputs['getCurrent'];
