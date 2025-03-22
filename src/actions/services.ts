'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { FullServiceRequest, FullServiceRequestInclude } from '@/types/service-request';

/**
 * Get all active consular services available for the user based on their country
 */
export async function getAvailableConsularServices() {
  const authResult = await checkAuth();

  try {
    const services = await db.consularService.findMany({
      where: {
        isActive: true,
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
