'use client';

import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import type { AppointmentInput } from '@/schemas/appointment';

export function useAppointments() {
  const t = useTranslations('appointments');
  const router = useRouter();
  const utils = api.useUtils();

  // Récupérer les rendez-vous de l'utilisateur
  const appointments = api.appointments.getUserAppointments.useQuery();

  // Créer un rendez-vous
  const createAppointment = api.appointments.create.useMutation({
    onSuccess: () => {
      toast.success(t('notifications.appointment_created'));
      utils.appointments.getUserAppointments.invalidate();
      router.push(ROUTES.user.appointments);
    },
    onError: (error) => {
      toast.error(error.message || t('notifications.create_failed'));
    },
  });

  // Annuler un rendez-vous
  const cancelAppointment = api.appointments.cancel.useMutation({
    onMutate: async (variables) => {
      // Annuler les requêtes en cours
      await utils.appointments.getUserAppointments.cancel();
      
      // Snapshot des données actuelles
      const previousAppointments = utils.appointments.getUserAppointments.getData();
      
      // Mise à jour optimiste
      if (previousAppointments) {
        utils.appointments.getUserAppointments.setData(undefined, {
          ...previousAppointments,
          upcoming: previousAppointments.upcoming.filter(apt => apt.id !== variables.id),
          cancelled: [
            ...previousAppointments.cancelled,
            ...previousAppointments.upcoming.filter(apt => apt.id === variables.id)
              .map(apt => ({ ...apt, status: 'CANCELLED' as const }))
          ],
        });
      }
      
      return { previousAppointments };
    },
    onSuccess: () => {
      toast.success(t('notifications.appointment_cancelled'));
    },
    onError: (error, variables, context) => {
      // Restaurer les données précédentes en cas d'erreur
      if (context?.previousAppointments) {
        utils.appointments.getUserAppointments.setData(undefined, context.previousAppointments);
      }
      toast.error(error.message || t('notifications.cancel_failed'));
    },
    onSettled: () => {
      // Toujours invalider pour s'assurer que les données sont à jour
      utils.appointments.getUserAppointments.invalidate();
    },
  });

  // Reprogrammer un rendez-vous
  const rescheduleAppointment = api.appointments.reschedule.useMutation({
    onSuccess: () => {
      toast.success(t('notifications.appointment_rescheduled'));
      utils.appointments.getUserAppointments.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || t('notifications.reschedule_failed'));
    },
  });

  // Marquer comme terminé (pour les agents)
  const completeAppointment = api.appointments.complete.useMutation({
    onSuccess: () => {
      toast.success(t('notifications.appointment_completed'));
      utils.appointments.getUserAppointments.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || t('notifications.complete_failed'));
    },
  });

  // Marquer comme manqué (pour les agents)
  const markAsMissed = api.appointments.markAsMissed.useMutation({
    onSuccess: () => {
      toast.success(t('notifications.appointment_missed'));
      utils.appointments.getUserAppointments.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || t('notifications.mark_missed_failed'));
    },
  });

  return {
    // Queries
    appointments: appointments.data,
    isLoading: appointments.isLoading,
    error: appointments.error,
    
    // Mutations
    createAppointment: {
      mutate: createAppointment.mutate,
      isLoading: createAppointment.isPending,
    },
    cancelAppointment: {
      mutate: cancelAppointment.mutate,
      isLoading: cancelAppointment.isPending,
    },
    rescheduleAppointment: {
      mutate: rescheduleAppointment.mutate,
      isLoading: rescheduleAppointment.isPending,
    },
    completeAppointment: {
      mutate: completeAppointment.mutate,
      isLoading: completeAppointment.isPending,
    },
    markAsMissed: {
      mutate: markAsMissed.mutate,
      isLoading: markAsMissed.isPending,
    },
    
    // Utilities
    refresh: () => utils.appointments.getUserAppointments.invalidate(),
  };
}

// Hook pour récupérer un rendez-vous spécifique
export function useAppointment(id: string) {
  const appointment = api.appointments.getById.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    appointment: appointment.data,
    isLoading: appointment.isLoading,
    error: appointment.error,
  };
}

// Hook pour récupérer les créneaux disponibles
export function useAvailableTimeSlots(params: {
  serviceId: string;
  organizationId: string;
  countryCode: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  agentId?: string;
}) {
  const timeSlots = api.appointments.getAvailableTimeSlots.useQuery(
    params,
    { enabled: !!(params.serviceId && params.organizationId && params.countryCode) }
  );

  return {
    timeSlots: timeSlots.data,
    isLoading: timeSlots.isLoading,
    error: timeSlots.error,
  };
}

// Hook pour récupérer les services disponibles
export function useAvailableServices(countryCode: string) {
  const services = api.appointments.getAvailableServices.useQuery(
    { countryCode },
    { enabled: !!countryCode }
  );

  return {
    services: services.data,
    isLoading: services.isLoading,
    error: services.error,
  };
}

// Hook pour les statistiques d'appointments
export function useAppointmentStats(params?: {
  agentId?: string;
  organizationId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const stats = api.appointments.getStats.useQuery(params ?? {});

  return {
    stats: stats.data,
    isLoading: stats.isLoading,
    error: stats.error,
  };
}

// Types pour faciliter l'utilisation
export type CreateAppointmentInput = AppointmentInput;
export type RescheduleAppointmentInput = {
  id: string;
  newDate: Date;
  newStartTime: Date;
  newEndTime: Date;
  newAgentId: string;
}; 