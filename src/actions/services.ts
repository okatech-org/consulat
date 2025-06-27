'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { FullServiceRequest, FullServiceRequestInclude } from '@/types/service-request';
import { tryCatch } from '@/lib/utils';
import { Prisma, ServiceRequest, UserDocument } from '@prisma/client';
import { assignAgentToRequest } from './agents';
import { CountryCode } from '@/lib/autocomplete-datas';

/**
 * Get all active consular services available for the user based on their country
 */
export async function getAvailableConsularServices() {
  const authResult = await checkAuth();

  try {
    const services = await db.consularService.findMany({
      where: {
        countryCode: authResult.user.countryCode,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return services;
  } catch (error) {
    console.error('Error fetching consular services:', error);
    throw new Error('Failed to fetch consular services');
  }
}

/**
 * Get user's service requests with their status and details
 */
export async function getUserServiceRequests() {
  const authResult = await checkAuth();

  try {
    const requests = await db.serviceRequest.findMany({
      where: {
        submittedById: authResult.user.id,
      },
      ...FullServiceRequestInclude,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return requests as FullServiceRequest[];
  } catch (error) {
    console.error('Error fetching service requests:', error);
    throw new Error('Failed to fetch service requests');
  }
}

/**
 * Get details of a specific service request
 */
export async function getServiceRequestDetails(requestId: string) {
  const authResult = await checkAuth();

  try {
    const request = await db.serviceRequest.findUnique({
      where: {
        id: requestId,
        submittedById: authResult.user.id,
      },
      ...FullServiceRequestInclude,
    });

    if (!request) {
      throw new Error('Service request not found');
    }

    return request as FullServiceRequest;
  } catch (error) {
    console.error('Error fetching service request details:', error);
    throw new Error('Failed to fetch service request details');
  }
}

/**
 * Get details of a specific consular service
 */
export async function getConsularServiceDetails(serviceId: string) {
  await checkAuth();

  try {
    const service = await db.consularService.findUnique({
      where: {
        id: serviceId,
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        steps: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!service) {
      throw new Error('Consular service not found');
    }

    return service;
  } catch (error) {
    console.error('Error fetching consular service details:', error);
    throw new Error('Failed to fetch consular service details');
  }
}

export async function getConsularService(id: string) {
  const service = await db.consularService.findUnique({
    where: { id },
    include: {
      steps: true,
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  if (!service) {
    throw new Error("Nous n'avons pas pu trouver le service");
  }

  return {
    ...service,
    steps: service.steps.map((step) => ({
      ...step,
      fields: JSON.parse(step.fields as string),
      validations: JSON.parse(step.validations as string),
    })),
  };
}

export async function submitServiceRequest(
  data: ServiceRequest & { requiredDocuments?: UserDocument[] },
) {
  // Ensure user is authenticated
  const authResult = await checkAuth();

  // Créer la demande
  const request = await db.serviceRequest.create({
    data: {
      serviceId: data.serviceId,
      submittedById: data.submittedById || authResult.user.id,
      requestedForId: data.requestedForId,
      organizationId: data.organizationId,
      countryCode: data.countryCode,
      serviceCategory: data.serviceCategory,
      status: 'SUBMITTED',
      formData: data.formData as Prisma.JsonObject,
      requiredDocuments: {
        connect: data.requiredDocuments?.map((doc) => ({ id: doc.id })) || [],
      },
      submittedAt: new Date(),
    },
  });

  if (request.organizationId) {
    const { error } = await tryCatch(
      assignAgentToRequest(
        request.id,
        request.organizationId,
        request.countryCode as CountryCode,
        db,
      ),
    );

    if (error) {
      // Log the error but continue with profile update
      console.error('Failed to assign agent:', error);
    }
  }

  return request;
}
