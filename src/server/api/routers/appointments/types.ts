import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { appointmentsRouter } from './appointments';

// Types d'input pour toutes les procédures du router appointments
export type AppointmentsRouterInputs = inferRouterInputs<typeof appointmentsRouter>;

// Types d'output pour toutes les procédures du router appointments
export type AppointmentsRouterOutputs = inferRouterOutputs<typeof appointmentsRouter>;

// Types spécifiques pour getList
export type AppointmentListQueryInput = AppointmentsRouterInputs['getList'];
export type AppointmentListQueryResult = AppointmentsRouterOutputs['getList'];

// Types pour les autres procédures principales
export type GetUserAppointmentsInput = AppointmentsRouterInputs['getUserAppointments'];
export type UserAppointments = AppointmentsRouterOutputs['getUserAppointments'];

export type GetUserAppointmentsDashboardInput =
  AppointmentsRouterInputs['getUserAppointmentsDashboard'];
export type UserAppointmentsDashboard =
  AppointmentsRouterOutputs['getUserAppointmentsDashboard'];

export type GetAppointmentByIdInput = AppointmentsRouterInputs['getById'];
export type AppointmentDetails = AppointmentsRouterOutputs['getById'];

export type CreateAppointmentInput = AppointmentsRouterInputs['create'];
export type CreateAppointmentResult = AppointmentsRouterOutputs['create'];

export type CancelAppointmentInput = AppointmentsRouterInputs['cancel'];
export type CancelAppointmentResult = AppointmentsRouterOutputs['cancel'];

export type RescheduleAppointmentInput = AppointmentsRouterInputs['reschedule'];
export type RescheduleAppointmentResult = AppointmentsRouterOutputs['reschedule'];

export type CompleteAppointmentInput = AppointmentsRouterInputs['complete'];
export type CompleteAppointmentResult = AppointmentsRouterOutputs['complete'];

export type MarkAsMissedInput = AppointmentsRouterInputs['markAsMissed'];
export type MarkAsMissedResult = AppointmentsRouterOutputs['markAsMissed'];

export type GetAvailableTimeSlotsInput =
  AppointmentsRouterInputs['getAvailableTimeSlots'];
export type AvailableTimeSlots = AppointmentsRouterOutputs['getAvailableTimeSlots'];

export type GetAvailableServicesInput = AppointmentsRouterInputs['getAvailableServices'];
export type AvailableServices = AppointmentsRouterOutputs['getAvailableServices'];

export type GetAppointmentStatsInput = AppointmentsRouterInputs['getStats'];
export type AppointmentStats = AppointmentsRouterOutputs['getStats'];
