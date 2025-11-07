'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * Hook pour récupérer un rendez-vous spécifique
 */
export function useAppointment(appointmentId: Id<'appointments'>) {
  const appointment = useQuery(api.functions.appointment.getAppointment, {
    appointmentId,
  });

  return {
    appointment,
    isLoading: appointment === undefined,
    error: null,
  };
}

/**
 * Hook pour créer un rendez-vous
 */
export function useCreateAppointment() {
  const createMutation = useMutation(api.functions.appointment.createAppointment);

  const createAppointment = async (data: {
    organizationId: Id<'organizations'>;
    type: string;
    timezone: string;
    startAt: number;
    endAt: number;
    serviceId?: Id<'services'>;
    requestId?: Id<'requests'>;
    location?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
      state?: string;
      complement?: string;
      coordinates?: { latitude: number; longitude: number };
    };
    participants: Array<{
      userId: Id<'users'>;
      role?: string;
      status?: string;
    }>;
  }) => {
    try {
      const result = await createMutation(data);
      toast.success('Rendez-vous créé avec succès');
      return result;
    } catch (error) {
      toast.error('Erreur lors de la création du rendez-vous');
      throw error;
    }
  };

  return {
    createAppointment,
    isCreating: false,
  };
}

/**
 * Hook pour confirmer un rendez-vous
 */
export function useConfirmAppointment() {
  const confirmMutation = useMutation(api.functions.appointment.confirmAppointment);

  const confirmAppointment = async (appointmentId: Id<'appointments'>) => {
    try {
      await confirmMutation({ appointmentId });
      toast.success('Rendez-vous confirmé');
    } catch (error) {
      toast.error('Erreur lors de la confirmation');
      throw error;
    }
  };

  return {
    confirmAppointment,
    isConfirming: false,
  };
}

/**
 * Hook pour annuler un rendez-vous
 */
export function useCancelAppointment() {
  const cancelMutation = useMutation(api.functions.appointment.cancelAppointment);

  const cancelAppointment = async (
    appointmentId: Id<'appointments'>,
    reason?: string,
  ) => {
    try {
      await cancelMutation({ appointmentId, reason });
      toast.success('Rendez-vous annulé');
    } catch (error) {
      toast.error("Erreur lors de l'annulation");
      throw error;
    }
  };

  return {
    cancelAppointment,
    isCancelling: false,
  };
}

/**
 * Hook pour compléter un rendez-vous
 */
export function useCompleteAppointment() {
  const completeMutation = useMutation(api.functions.appointment.completeAppointment);

  const completeAppointment = async (appointmentId: Id<'appointments'>) => {
    try {
      await completeMutation({ appointmentId });
      toast.success('Rendez-vous marqué comme complété');
    } catch (error) {
      toast.error('Erreur lors de la complétion');
      throw error;
    }
  };

  return {
    completeAppointment,
    isCompleting: false,
  };
}

/**
 * Hook pour reprogrammer un rendez-vous
 */
export function useRescheduleAppointment() {
  const rescheduleMutation = useMutation(api.functions.appointment.rescheduleAppointment);

  const rescheduleAppointment = async (
    appointmentId: Id<'appointments'>,
    newStartAt: number,
    newEndAt: number,
    timezone?: string,
  ) => {
    try {
      await rescheduleMutation({ appointmentId, newStartAt, newEndAt, timezone });
      toast.success('Rendez-vous reprogrammé');
    } catch (error) {
      toast.error('Erreur lors de la reprogrammation');
      throw error;
    }
  };

  return {
    rescheduleAppointment,
    isRescheduling: false,
  };
}

/**
 * Hook pour vérifier la disponibilité
 */
export function useAppointmentAvailability(
  organizationId: Id<'organizations'>,
  date: number,
  duration: number,
) {
  const availability = useQuery(api.functions.appointment.getAppointmentAvailability, {
    organizationId,
    date,
    duration,
  });

  return {
    availability,
    isLoading: availability === undefined,
    error: null,
  };
}
