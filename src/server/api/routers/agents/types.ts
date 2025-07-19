import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { agentsRouter } from './agents';

// Types d'input pour toutes les procédures du router agents
export type AgentsRouterInputs = inferRouterInputs<typeof agentsRouter>;

// Types d'output pour toutes les procédures du router agents
export type AgentsRouterOutputs = inferRouterOutputs<typeof agentsRouter>;

// Types spécifiques pour getList
export type AgentListQueryInput = AgentsRouterInputs['getList'];
export type AgentListQueryResult = AgentsRouterOutputs['getList'];
export type AgentListItem = AgentListQueryResult['items'][number];

// Types pour les autres procédures principales
export type GetAgentByIdInput = AgentsRouterInputs['getById'];
export type AgentDetails = AgentsRouterOutputs['getById'];

export type CreateAgentInput = AgentsRouterInputs['create'];
export type CreateAgentResult = AgentsRouterOutputs['create'];

export type UpdateAgentInput = AgentsRouterInputs['update'];
export type UpdateAgentResult = AgentsRouterOutputs['update'];

export type AssignRequestInput = AgentsRouterInputs['assignRequest'];
export type AssignRequestResult = AgentsRouterOutputs['assignRequest'];

export type ReassignRequestInput = AgentsRouterInputs['reassignRequest'];
export type ReassignRequestResult = AgentsRouterOutputs['reassignRequest'];

export type GetAvailableAgentsInput = AgentsRouterInputs['getAvailable'];
export type AvailableAgents = AgentsRouterOutputs['getAvailable'];

export type GetAgentPerformanceInput = AgentsRouterInputs['getPerformanceMetrics'];
export type AgentPerformanceMetrics = AgentsRouterOutputs['getPerformanceMetrics'];

export type GetAgentStatsInput = AgentsRouterInputs['getStats'];
export type AgentsStats = AgentsRouterOutputs['getStats'];
