import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { feedbackRouter } from './feedback';

// Types d'input pour toutes les procédures du router feedbacks
export type FeedbackRouterInputs = inferRouterInputs<typeof feedbackRouter>;

// Types d'output pour toutes les procédures du router feedbacks
export type FeedbackRouterOutputs = inferRouterOutputs<typeof feedbackRouter>;

// Types spécifiques pour create
export type CreateFeedbackInput = FeedbackRouterInputs['create'];
export type CreateFeedbackResult = FeedbackRouterOutputs['create'];

// Types pour getMyFeedbacks
export type MyFeedbacks = FeedbackRouterOutputs['getMyFeedbacks'];

// Types pour getAdminList
export type GetAdminFeedbackListInput = FeedbackRouterInputs['getAdminList'];
export type AdminFeedbackList = FeedbackRouterOutputs['getAdminList'];

// Types pour respondToFeedback
export type RespondToFeedbackInput = FeedbackRouterInputs['respondToFeedback'];
export type RespondToFeedbackResult = FeedbackRouterOutputs['respondToFeedback'];

// Types pour updateStatus
export type UpdateFeedbackStatusInput = FeedbackRouterInputs['updateStatus'];
export type UpdateFeedbackStatusResult = FeedbackRouterOutputs['updateStatus'];

// Types pour getStats
export type FeedbackStats = FeedbackRouterOutputs['getStats'];
