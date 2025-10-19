import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { validateService } from '../helpers/validation';
import { ServiceCategory, ServiceStatus } from '../lib/constants';
import type { Doc } from '../_generated/dataModel';
import {
  serviceCategoryValidator,
  serviceStatusValidator,
  processingModeValidator,
  deliveryModeValidator,
  serviceStepValidator,
} from '../lib/validators';

// Mutations
export const createService = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: serviceCategoryValidator,
    status: v.optional(serviceStatusValidator),
    countries: v.array(v.string()),
    organizationId: v.id('organizations'),
    steps: v.array(serviceStepValidator),
    processing: v.object({
      mode: processingModeValidator,
      appointment: v.object({
        requires: v.boolean(),
        duration: v.optional(v.number()),
        instructions: v.optional(v.string()),
      }),
      proxy: v.optional(
        v.object({
          allows: v.boolean(),
          requirements: v.optional(v.string()),
        }),
      ),
    }),
    delivery: v.object({
      modes: v.array(deliveryModeValidator),
      appointment: v.optional(
        v.object({
          requires: v.boolean(),
          duration: v.optional(v.number()),
          instructions: v.optional(v.string()),
        }),
      ),
      proxy: v.optional(
        v.object({
          allows: v.boolean(),
          requirements: v.optional(v.string()),
        }),
      ),
    }),
    pricing: v.object({
      isFree: v.boolean(),
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
    }),
    automations: v.optional(v.id('workflows')),
    legacyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const serviceData = {
      name: args.name,
      code: args.code,
      price: args.pricing.price,
    };

    const validationErrors = validateService(serviceData);
    if (validationErrors.length > 0) {
      throw new Error(
        `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
      );
    }

    const serviceId = await ctx.db.insert('services', {
      code: args.code,
      name: args.name,
      description: args.description,
      category: args.category,
      status: args.status ?? ServiceStatus.Active,
      countries: args.countries,
      organizationId: args.organizationId,
      steps: args.steps,
      processing: args.processing,
      delivery: args.delivery,
      pricing: args.pricing,
      automations: args.automations,
      legacyId: args.legacyId,
    });

    const organization = await ctx.db.get(args.organizationId);
    if (organization) {
      await ctx.db.patch(args.organizationId, {
        serviceIds: [...organization.serviceIds, serviceId],
      });
    }

    return serviceId;
  },
});

export const updateService = mutation({
  args: {
    serviceId: v.id('services'),
    code: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(serviceCategoryValidator),
    status: v.optional(serviceStatusValidator),
    countries: v.optional(v.array(v.string())),
    steps: v.optional(v.array(serviceStepValidator)),
    processing: v.optional(
      v.object({
        mode: processingModeValidator,
        appointment: v.object({
          requires: v.boolean(),
          duration: v.optional(v.number()),
          instructions: v.optional(v.string()),
        }),
        proxy: v.optional(
          v.object({
            allows: v.boolean(),
            requirements: v.optional(v.string()),
          }),
        ),
      }),
    ),
    delivery: v.optional(
      v.object({
        modes: v.array(deliveryModeValidator),
        appointment: v.optional(
          v.object({
            requires: v.boolean(),
            duration: v.optional(v.number()),
            instructions: v.optional(v.string()),
          }),
        ),
        proxy: v.optional(
          v.object({
            allows: v.boolean(),
            requirements: v.optional(v.string()),
          }),
        ),
      }),
    ),
    pricing: v.optional(
      v.object({
        isFree: v.boolean(),
        price: v.optional(v.number()),
        currency: v.optional(v.string()),
      }),
    ),
    automations: v.optional(v.id('workflows')),
    legacyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingService = await ctx.db.get(args.serviceId);
    if (!existingService) {
      throw new Error('Service not found');
    }

    if (args.name || args.code || args.pricing?.price !== undefined) {
      const serviceData = {
        name: args.name || existingService.name,
        code: args.code || existingService.code,
        price:
          args.pricing?.price !== undefined
            ? args.pricing.price
            : existingService.pricing?.price,
      };

      const validationErrors = validateService(serviceData);
      if (validationErrors.length > 0) {
        throw new Error(
          `Validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
        );
      }
    }

    const updateData = {
      ...(args.code && { code: args.code }),
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.category && { category: args.category }),
      ...(args.status && { status: args.status }),
      ...(args.countries && { countries: args.countries }),
      ...(args.steps && { steps: args.steps }),
      ...(args.processing && { processing: args.processing }),
      ...(args.delivery && { delivery: args.delivery }),
      ...(args.pricing && { pricing: args.pricing }),
      ...(args.automations && { automations: args.automations }),
      ...(args.legacyId && { legacyId: args.legacyId }),
    };

    await ctx.db.patch(args.serviceId, updateData);
    return args.serviceId;
  },
});

export const toggleServiceStatus = mutation({
  args: { serviceId: v.id('services') },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const newStatus =
      service.status === ServiceStatus.Active
        ? ServiceStatus.Inactive
        : ServiceStatus.Active;

    await ctx.db.patch(args.serviceId, {
      status: newStatus,
    });

    return { serviceId: args.serviceId, newStatus };
  },
});

// Queries
export const getService = query({
  args: { serviceId: v.id('services') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.serviceId);
  },
});

export const getServiceByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('services')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();
  },
});

export const getAllServices = query({
  args: {
    status: v.optional(serviceStatusValidator),
    category: v.optional(serviceCategoryValidator),
    organizationId: v.optional(v.id('organizations')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let services: Array<Doc<'services'>> = [];

    if (args.organizationId && args.category && args.status) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
        .filter((q) =>
          q.and(
            q.eq(q.field('category'), args.category!),
            q.eq(q.field('status'), args.status!),
          ),
        )
        .order('desc')
        .collect();
    } else if (args.organizationId && args.category) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
        .filter((q) => q.eq(q.field('category'), args.category!))
        .order('desc')
        .collect();
    } else if (args.organizationId && args.status) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect();
    } else if (args.category && args.status) {
      services = await ctx.db
        .query('services')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect();
    } else if (args.organizationId) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
        .order('desc')
        .collect();
    } else if (args.category) {
      services = await ctx.db
        .query('services')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .order('desc')
        .collect();
    } else if (args.status) {
      services = await ctx.db
        .query('services')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect();
    } else {
      services = await ctx.db.query('services').order('desc').collect();
    }

    return args.limit
      ? services
          .filter((service) => service.category !== ServiceCategory.Registration)
          .slice(0, args.limit)
      : services.filter((service) => service.category !== ServiceCategory.Registration);
  },
});

export const getServicesByOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('services')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
      .order('desc')
      .collect();
  },
});

export const getServicesByCategory = query({
  args: { category: serviceCategoryValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('services')
      .withIndex('by_category', (q) => q.eq('category', args.category))
      .order('desc')
      .collect();
  },
});

export const searchServices = query({
  args: {
    searchTerm: v.string(),
    organizationId: v.optional(v.id('organizations')),
    category: v.optional(serviceCategoryValidator),
  },
  handler: async (ctx, args) => {
    let services: Array<Doc<'services'>> = [];

    if (args.organizationId && args.category) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
        .filter((q) => q.eq(q.field('category'), args.category!))
        .collect();
    } else if (args.organizationId) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
        .collect();
    } else if (args.category) {
      services = await ctx.db
        .query('services')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .collect();
    } else {
      services = await ctx.db.query('services').collect();
    }

    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        service.code.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        (service.description &&
          service.description.toLowerCase().includes(args.searchTerm.toLowerCase())),
    );
  },
});

export const deleteService = mutation({
  args: { serviceId: v.id('services') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.serviceId);
    return args.serviceId;
  },
});
