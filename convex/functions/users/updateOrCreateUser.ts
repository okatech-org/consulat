import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const updateOrCreateUser = mutation({
  args: {
    clerkUser: v.any(), // Données de l'utilisateur depuis Clerk
  },
  handler: async (ctx, args) => {
    const { clerkUser } = args;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", clerkUser.id))
      .first();

    if (existingUser) {
      // Mettre à jour l'utilisateur existant
      await ctx.db.patch(existingUser._id, {
        firstName: clerkUser.first_name || existingUser.firstName,
        lastName: clerkUser.last_name || existingUser.lastName,
        email:
          clerkUser.email_addresses?.[0]?.email_address || existingUser.email,
        phoneNumber:
          clerkUser.phone_numbers?.[0]?.phone_number ||
          existingUser.phoneNumber,
        updatedAt: Date.now(),
        lastActiveAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Créer un nouvel utilisateur
      const newUserId = await ctx.db.insert("users", {
        userId: clerkUser.id,
        legacyId: undefined,
        firstName: clerkUser.first_name,
        lastName: clerkUser.last_name,
        email: clerkUser.email_addresses?.[0]?.email_address,
        phoneNumber: clerkUser.phone_numbers?.[0]?.phone_number,
        roles: ["user"], // Rôle par défaut
        status: "active",
        profileId: undefined,
        countryCode: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastActiveAt: Date.now(),
      });
      return newUserId;
    }
  },
});
